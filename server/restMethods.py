from flask import Flask, jsonify, request
import pymysql.cursors
import pymysql
import sys
import json
import bcrypt

# Load config.json into "config"
with open("../config.json") as f:
	config = json.load(f)["databaseConnection"]

lastRowID = -1

host=config["host"]
user=config["user"]
password=config["password"]
db=config["db"]
port=int(config["port"])
charset=config["charset"]
cursorclass=pymysql.cursors.DictCursor

# NOTE: THIS METHOD IS UNSAFE FOR USER INPUT. USER FOR ONLY INTERNAL QUERIES
# Get database records
# Parameters:
#  query - A query that specifically retrieves data i.e. "select *"
# Returns:
#  A flask response object: http://flask.pocoo.org/docs/0.12/api/#flask.Response
def sendUnsafeGetRequest(query):
  try:
    conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass)
    cursor = conn.cursor()
    cursor.execute(query)
    return jsonify(cursor.fetchall())
  finally:
    cursor.close()
    conn.close()

# Get database records. NOTE: ANDCONDITIONS ARE NOT USER-INPUT SAFE
# Parameters:
#	columns[List(<str>)] - Column names with their variables. Ex: "*", "p1.*", etc.
#	tables[List(<str>)] - Table names with their variables. Ex: "users", "products p", etc.
#	elements[<Dict>] - Key value pairs for user inserted data. Ex: `"product_id":str(id)", "threat_desc": "this is a threat desc"
#	andConditions[List(<str>)] - Conditions with "and" preceding it
#	andOnFirst[<bool>] - Whether there should be a preceding "and" on the first element of "andConditions"
# Returns:
#	A flask response object: http://flask.pocoo.org/docs/0.12/api/#flask.Response
def sendGetRequest(columns, tables, elements=None, andConditions=None, andOnFirst=True, limitArr=None, likeColumn="", likeContent=""):
	try:
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass)
		cursor = conn.cursor()
		limit = ""
		if (limitArr is not None):
			limit += " limit " + str(limitArr[0]) + ", " + str(limitArr[1])
		andCondsStr = ""
		if (andConditions is not None):
			index = 0
			for andCond in andConditions:
				if not ((index == 0) and (andOnFirst == False)):
					andCondsStr += " and "
				andCondsStr += andCond
				index += 1
		if (elements is not None):
			parsedJSON = parseJSONUnion(elements, ", ")
			if (likeColumn != ""):
				likeColumn = " and " + likeColumn + " like %s"
				parsedJSON[1].append("%" + likeContent + "%")
			cursor.execute("select " + ', '.join(columns) + " from " + ', '.join(tables) + " where " + parsedJSON[0] + andCondsStr + likeColumn + limit + ";", [parsedJSON[1]])
		else:
			where = ""
			likeSubstitution = []
			if (andConditions is not None):
				where = " where "
				if (likeColumn != ""):
					likeColumn = " and " + likeColumn + " like %s"
					likeSubstitution.append("%" + likeContent + "%")
			else:
				if (likeColumn != ""):
					likeColumn = " " + likeColumn + " like %s"
					likeSubstitution.append("%" + likeContent + "%")
			if len(likeSubstitution) > 0:
				cursor.execute("select " + ', '.join(columns) + " from " + ', '.join(tables) + " where " + andCondsStr + likeColumn + limit + ";", [likeSubstitution])
			else:
				cursor.execute("select " + ', '.join(columns) + " from " + ', '.join(tables) + where + andCondsStr + limit + ";")
		return jsonify(cursor.fetchall())
	finally:
		cursor.close()
		conn.close()

# Insert new database record(s)
# Parameters:
#	tableName - database table name to send the request to
# 	elements - a dictionary of key-value pairs: {"key":"value","key","value"...}
# Returns:
# 	Result of success() method if successful
def sendPostRequest(tableName, elements=None):
	try:
		if elements is None:
			elements = request.json
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass)
		cursor = conn.cursor()
		parsedJSON = parseJSONSeparate(elements)
		substitutionString = ""
		for x in range(0, len(elements)):
			substitutionString += "%s"
			if (x < len(elements)-1):
				substitutionString += ", "
		cursor.executemany("insert ignore into " + tableName + " (" + parsedJSON[0] + ") values (" + substitutionString + ");", [parsedJSON[1]])
		conn.commit()
		global lastRowID
		lastRowID = cursor.lastrowid
		return success()
	finally:
		cursor.close()
		conn.close()

# Update existing database record
# Parameters:
#	tableName - database table name to send the request to
#	idColumnName - column name of table's primary key
# 	idValue - value of table's primary key
# 	elements - a dictionary of key-value pairs: {"key":"value","key","value"...}
# Returns:
# 	Result of success() method if successful
def sendPutRequest(tableName, idColumnName, idValue, elements=None):
	try:
		if elements is None:
			elements = request.json
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass)
		cursor = conn.cursor()
		parsedJSON = parseJSONUnion(elements, ", ")
		cursor.execute("update " + tableName + " set " + parsedJSON[0] + " where " + idColumnName + "=" + str(idValue), [parsedJSON[1]])
		conn.commit()
		return success()
	finally:
		cursor.close()
		conn.close()

# Delete existing database record(s)
# Parameters:
#	tableName - database table name to send the request to
# 	elements - a dictionary of key-value pairs: {"key":"value","key","value"...}
# Returns:
# 	Result of success() method if successful
def sendDeleteRequest(tableName, elements):
	try:
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass)
		cursor = conn.cursor()
		parsedJSON = parseJSONUnion(elements, " and ")
		cursor.execute("delete from " + tableName + " where " + parsedJSON[0], [parsedJSON[1]])
		conn.commit()
		return success()
	finally:
		cursor.close()
		conn.close()

# Converts a dictionary of key-value pairs into two separate arrays of keys and values
# Parameters:
# 	elements - a dictionary of key-value pairs: {"key":value,"key",value...}
# Returns:
# 	parses JSON into two strings:
# 		arr[0] = (key, key, key, key)
# 		arr[1] = (value, value, value, value)
def parseJSONSeparate(elements):
	requestKeys = ""
	requestValues = [""] * len(elements)
	index = 0
	for element in elements:
		requestKeys += element
		if elements[element]:
			requestValues[index] = elements[element]
		else:
			requestValues[index] = "NULL"
		if index < len(elements)-1 :
			requestKeys += ", "
		index += 1
	parsedJSON = ["", []]
	parsedJSON[0] = requestKeys
	parsedJSON[1] = requestValues
	return parsedJSON

# parses JSON into a string: "key=value<separator>key=value<separator>key=value..."
# Returns an array that contains [0] "key=%s<separator>key=%s<separator>" and [1] ["value", "value"...]
def parseJSONUnion(elements, separator):
	requestKeys = ""
	requestValues = [""] * len(elements)
	index = 0
	for element in elements:
		requestKeys += element + "=%s"
		if elements[element]:
			requestValues[index] = elements[element]
		else:
			requestValues[index] = "NULL"
		if index < len(elements)-1 :
			requestKeys += separator
		index += 1

	parsedJSON = ["", []]
	parsedJSON[0] = requestKeys
	parsedJSON[1] = requestValues
	return parsedJSON

# If an error occurs this method will return details
def error():
	error = sys.exc_info()[0].__name__ + ': ' + str(sys.exc_info()[1]) + " occured on line:  " + str(sys.exc_info()[-1].tb_lineno)
	return  error + '\n', 500

def success():
	return "Request was a success!"

'''
Custom Methods
'''

# Adds a product and returns that product's id to add keywords right after
def postProduct():
	sendPostRequest("products")
	return sendGetRequest(["max(product_id)"], ["products"])

# Adds a keyword for a product
def postProductKeyword(prodId):
	sendPostRequest("keywords", {"keyword":request.json['keyword'], "product_id":prodId})
	product_editor = ""
	try:
		product_editor = request.json['product_editor']
	except Exception:
		product_editor = ""

	return sendPutRequest("products", "product_id", prodId, {"product_editor":product_editor})

# Adds threat for a product
def postProductThreat(prodId):
	request.json["product_id"] = prodId
	request.json["threat_classification"] = createEmptyClassification(request.json["threat_desc"])
	return sendPostRequest("threats")

# Add a new user to the database, encrypting the password with bcrypt
def postNewUser():
	request.json["user_password"] = bcrypt.hashpw(request.json["user_password"].encode(charset), bcrypt.gensalt(14))
	return sendPostRequest("users")

def postFirstUser():
	if hasUsers() == "False":
		request.json["user_password"] = bcrypt.hashpw(request.json["user_password"].encode(charset), bcrypt.gensalt(14))
		return sendPostRequest("users")
	else:
		return error()

def getThreatPageCount(desc="", title=""):
	if (desc != ""):
		threatCountRequest = sendGetRequest(["COUNT(*)"], ["threats"], likeColumn="threat_desc", likeContent=desc)
	elif (title != ""):
		threatCountRequest = sendGetRequest(["COUNT(*)"], ["threats"], likeColumn="threat_title", likeContent=desc)
	else:
		threatCountRequest = sendGetRequest(["COUNT(*)"], ["threats"])
	threatCount = json.loads(threatCountRequest.response[0])[0]["COUNT(*)"]
	return str(((threatCount + 10) / 10))

def getThreatQuery(currentPage, desc="", title=""):
	if (desc != ""):
		return sendGetRequest(["threat_id", "threat_desc", "threat_title", "threat_date"], ["threats"], likeColumn="threat_desc", likeContent=desc, limitArr=[(currentPage * 10) - 10, 10])
	elif (title != ""):
		return sendGetRequest(["threat_id", "threat_desc", "threat_title", "threat_date"], ["threats"], likeColumn="threat_title", likeContent=desc, limitArr=[(currentPage * 10) - 10, 10])
	else:
		return sendGetRequest(["threat_id", "threat_desc", "threat_title", "threat_date"], ["threats"], limitArr=[(currentPage * 10) - 10, 10])

# Add the first user. This is only possible if no users exist in the database
def hasUsers():
	userCount = sendGetRequest(["COUNT(*)"], ["users"])
	if json.loads(userCount.response[0])[0]["COUNT(*)"] > 0:
		return "True"
	return "False"

# Adds a threat to a user's watchlist
def postSavedThreat(id):
	request.json["user_id"] = id
	return sendPostRequest("users_threats")

# Adds a product to a user's watchlist
def postSavedProduct(id):
	request.json["user_id"] = id
	return sendPostRequest("users_products")

# Update a threat
def putThreatDesc(id):
	sendPutRequest("threats", "threat_id", id)
