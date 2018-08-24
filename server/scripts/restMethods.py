from flask import Flask, jsonify, request
import pymysql.cursors
import pymysql
import os
import sys
import json
import bcrypt
from nltk.tokenize import word_tokenize
import traceback
from pypika import Query, Table, Field, Order

__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

# Load config.json into "config"
with open(os.path.join(__location__, '../config.json')) as f:
	config = json.load(f)["databaseConnection"]

# lastrowID is populated with the id of an inserted/updated element
lastRowID = -1

host=config["host"]
user=config["user"]
password=config["password"]
db=config["db"]
port=int(config["port"])
charset=config["charset"]
sslFile=config["caCert"]
ssl = None
if (sslFile):
	ssl = { 'ca': os.path.join(__location__, '../' + sslFile)}

cursorclass=pymysql.cursors.DictCursor

# NOTE: THIS METHOD IS UNSAFE FOR USER INPUT. USER FOR ONLY INTERNAL QUERIES
# Get database records given a raw SQL query
# Parameters:
#  query - A query that specifically retrieves data i.e. "select *"
# Returns:
#  A flask response object: http://flask.pocoo.org/docs/0.12/api/#flask.Response
def sendUnsafeGetRequest(query):
	conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
	cursor = conn.cursor()
	try:
		cursor.execute(query)
		return jsonify(cursor.fetchall())
	finally:
		cursor.close()
		conn.close()

# Executes a query
# Parameters:
#	query - a PyPika query object
# Returns:
# 	Result of success() method if successful
# TODO: Throw error if query is not pypika query object
def executeQuery(query):
	try:
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
		cursor.execute(query.get_sql())
		conn.commit()
		global lastRowID
		lastRowID = cursor.lastrowid
		return jsonify(cursor.fetchall())
	finally:
		cursor.close()
		conn.close()

# Get database record(s). NOTE: ANDCONDITIONS ARE NOT USER-INPUT SAFE
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
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
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
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
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
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
		parsedJSON = parseJSONUnion(elements, ", ")
		cursor.execute("update " + tableName + " set " + parsedJSON[0] + " where " + idColumnName + "=" + str(idValue), parsedJSON[1])
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
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
		parsedJSON = parseJSONUnion(elements, " and ")
		cursor.execute("delete from " + tableName + " where " + parsedJSON[0], [parsedJSON[1]])
		conn.commit()
		return success()
	finally:
		cursor.close()
		conn.close()

# Take a string, tokenize it and return a list of "O "'s. One O per token
# This is for the purpose of training Stanford's CoreNLP Classifier
# Parameters:
#	str - the string to tokenize and count tokens off of
# Returns:
# 	A "O " for each token in inputted string
# 		"hello, my name is Will" => "0 0 0 0 0 0 "
def createEmptyClassification(str):
	output = ""
	for x in range(len(word_tokenize(str))):
		output += "O "
	return output

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
			if (isinstance(elements[element], unicode)):
				requestValues[index] = elements[element].encode(charset)
			else:
				requestValues[index] = elements[element]
		else:
			requestValues[index] = None
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
			requestValues[index] = None
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
	# uncomment the line below to output errors
	#traceback.print_exception(*sys.exc_info())
	return  error + '\n', 500

def success():
	return "Request was a success!"

'''
Custom Methods
'''

# Gets records for a particular classifcation table
# A function call like this...
# 	getThreatClassifications(34781, "adversaries", "adv")
# ...returns:
# 	[{u'adv_desc': None, u'adv_name': u'local users', u'adv_id': 47}, {u'adv_desc': None, u'adv_name': u'unspecified other impact', u'adv_id': 49}]
def getThreatClassifications(id, tableName, tableShortcode):
	return sendUnsafeGetRequest(("select joinedtable." + tableShortcode + "_desc, joinedtable." + tableShortcode + "_id, joinedtable." + tableShortcode + "_name " +
								"from threats INNER JOIN (select " + tableShortcode + "_desc, " + tableShortcode + "_id, " + tableShortcode + "_name, fk_threat_id from " + tableName +
										" INNER JOIN " + tableName + "_threats_xref on " + tableName + "." + tableShortcode + "_id = " + tableName + "_threats_xref.fk_" + tableShortcode + "_id) joinedtable on threats.threat_id = joinedtable.fk_threat_id where threat_id=" + str(id)))

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

# Add a new user to the database
def postNewUser():
	return sendPostRequest("users")

def postFirstUser():
	if hasUsers() == "False":
		request.json["user_password"] = bcrypt.hashpw(request.json["user_password"].encode(charset), bcrypt.gensalt(14))
		return sendPostRequest("users")
	else:
		return error()

# Before performing a basic search get the page count for pagination
# If type == "desc": counts all all threats that have a specific threat_desc
# if type == "title": counts all threats that have a specific threat_title
def getThreatPageCount(type=""):
	threats = Table("threats")
	if (type == "desc"):
		# count all threats that have a threat_desc that includes the search query
		threatCountRequest = sendUnsafeGetRequest(Query.from_(threats).select("COUNT(*)").where(threats.threat_desc.like("%" + request.json["searchQuery"] + "%")).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate()).get_sql())
	elif (type == "title"):
		# count all threats that have a threat_title that includes the search query
		threatCountRequest = sendUnsafeGetRequest(Query.from_(threats).select("COUNT(*)").where(threats.threat_title.like("%" + request.json["searchQuery"] + "%")).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate()).get_sql())
	else:
		threatCountRequest = sendUnsafeGetRequest(Query.from_(threats).select("COUNT(*)").where((threats.threat_title.like("%" + request.json["searchQuery"] + "%")) | (threats.threat_desc.like("%" + request.json["searchQuery"] + "%"))).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate()).get_sql())
	threatCount = json.loads(threatCountRequest.response[0])[0]["COUNT(*)"]
	return str(((threatCount + 9) / 10))

# Performs a paginated basic search
def getThreatQuery(currentPage, type=""):
	sortDirection = request.json["sortDirection"]
	sortField = request.json["sortField"]
	threats = Table("threats")
	query = Query.from_(threats).select("threat_id", "threat_desc", "threat_title", "STR_TO_DATE(threat_date, '%m/%d/%Y') as threat_date")
	if (type == "desc"):
		# get all threats that have a threat_desc that includes the search query, limiting by the current page
		query = query.where(threats.threat_desc.like("%" + request.json["searchQuery"] + "%")).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate()).limit("10").offset(str((currentPage * 10) - 10))
	elif (type == "title"):
		# get all threats that have a threat_title that includes the search query, limiting by the current page
		query = query.where(threats.threat_title.like("%" + request.json["searchQuery"] + "%")).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate()).limit("10").offset(str((currentPage * 10) - 10))
	else:
		query = query.where((threats.threat_title.like("%" + request.json["searchQuery"] + "%")) | (threats.threat_desc.like("%" + request.json["searchQuery"] + "%"))).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate()).limit("10").offset(str((currentPage * 10) - 10))
	if (sortField and sortDirection):
		if (sortDirection == "asc"):
			query = query.orderby(str(sortField), order=Order.asc)
		if (sortDirection == "desc"):
			query = query.orderby(str(sortField), order=Order.desc)
	return sendUnsafeGetRequest(query.get_sql())

# Performs a full search
def getFullThreatQuery(type=""):
	sortDirection = request.json["sortDirection"]
	sortField = request.json["sortField"]
	threats = Table("threats")
	query = Query.from_(threats).select("threat_id", "threat_desc", "threat_title", "STR_TO_DATE(threat_date, '%m/%d/%Y') as threat_date")
	if (type == "desc"):
		# get all threats that have a threat_desc that includes the search query, limiting by the current page
		query = query.where(threats.threat_desc.like("%" + request.json["searchQuery"] + "%")).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate())
	elif (type == "title"):
		# get all threats that have a threat_title that includes the search query, limiting by the current page
		query = query.where(threats.threat_title.like("%" + request.json["searchQuery"] + "%")).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate())
	else:
		query = query.where((threats.threat_title.like("%" + request.json["searchQuery"] + "%")) | (threats.threat_desc.like("%" + request.json["searchQuery"] + "%"))).where(threats.threat_status.isin(["-N/A-", "-New N/A-"]).negate())
	if (sortField and sortDirection):
		if (sortDirection == "asc"):
			query = query.orderby(str(sortField), order=Order.asc)
		elif (sortDirection == "desc"):
			query = query.orderby(str(sortField), order=Order.desc)
	return sendUnsafeGetRequest(query.get_sql())

# Performs an advanced search
def getAdvancedThreatQuery():
	adversaryIds = request.json["classifications"]["adversaries"]
	assetIds = request.json["classifications"]["assets"]
	attackTypeIds = request.json["classifications"]["attackTypes"]
	attackVectorIds = request.json["classifications"]["attackVectors"]
	vulnerabilityIds = request.json["classifications"]["vulnerabilities"]
	adversariesInclusive = request.json["inclusivity"]["adversaries"]
	assetsInclusive = request.json["inclusivity"]["assets"]
	attackTypesInclusive = request.json["inclusivity"]["attackTypes"]
	attackVectorsInclusive = request.json["inclusivity"]["attackVectors"]
	vulnerabilitiesInclusive = request.json["inclusivity"]["vulnerabilities"]
	isCounting = request.json["isCounting"]
	pageNumber = request.json["pageNumber"]
	totalIds = len(adversaryIds) + len(assetIds) + len(attackTypeIds) + len(attackVectorIds) + len(vulnerabilityIds)
	if (totalIds):
		threatIdQuery = ("SELECT " + getStrIfArr(adversaryIds, "fk_adv_id, ") + getStrIfArr(assetIds, "fk_asset_id, ") + getStrIfArr(attackTypeIds, "fk_atktyp_id, ") + getStrIfArr(attackVectorIds, "fk_atkvtr_id, ") + getStrIfArr(vulnerabilityIds, "fk_vuln_id, ") + "threat_id, threat_title FROM threats "
							+ getStrIfArr(adversaryIds, "INNER JOIN adversaries_threats_xref on threats.threat_id = adversaries_threats_xref.fk_threat_id ")
							+ getStrIfArr(assetIds, "INNER JOIN assets_threats_xref on threats.threat_id = assets_threats_xref.fk_threat_id ")
							+ getStrIfArr(attackTypeIds, "INNER JOIN attack_types_threats_xref on threats.threat_id = attack_types_threats_xref.fk_threat_id ")
							+ getStrIfArr(attackVectorIds, "INNER JOIN attack_vectors_threats_xref on threats.threat_id = attack_vectors_threats_xref.fk_threat_id ")
							+ getStrIfArr(vulnerabilityIds, "INNER JOIN vulnerabilities_threats_xref on threats.threat_id = vulnerabilities_threats_xref.fk_threat_id "))
		index = 0
		whereConditions = [getStrIfArr(adversaryIds, "fk_adv_id in (" + ', '.join(str(e) for e in adversaryIds) + ")"),
							getStrIfArr(assetIds, "fk_asset_id in (" + ', '.join(str(e) for e in assetIds) + ")"),
							getStrIfArr(attackTypeIds, "fk_atktyp_id in (" + ', '.join(str(e) for e in attackTypeIds) + ")"),
							getStrIfArr(attackVectorIds, "fk_atkvtr_id in (" + ', '.join(str(e) for e in attackVectorIds) + ")"),
							getStrIfArr(vulnerabilityIds, "fk_vuln_id in (" + ', '.join(str(e) for e in vulnerabilityIds) + ")")]

		# Establish first where condition
		for x in range(5):
			if whereConditions[x]:
				threatIdQuery += "where " + whereConditions[x]
				index += 1
				break
			index += 1

		# add subsequest "and" conditions
		for x in range(index, 5):
			if whereConditions[x]:
				threatIdQuery += " and " + whereConditions[x]
		threatIdsResponse = sendUnsafeGetRequest(threatIdQuery.encode(charset))
		threatIds = associativeArrayToUniqueIndexed(json.loads(threatIdsResponse.response[0]), "threat_id")
		threatIds = extractMatchedThreats(json.loads(threatIdsResponse.response[0]), threatIds, adversaryIds, assetIds, attackTypeIds, attackVectorIds, vulnerabilityIds, adversariesInclusive, assetsInclusive, attackTypesInclusive, attackVectorsInclusive, vulnerabilitiesInclusive)

		if isCounting:
			return str((len(threatIds) + 9) / 10)

		if pageNumber:
			threatIds = limitOutput(threatIds, (int(pageNumber) * 10) - 10, 10)
		finalThreatsDict = []
		for id in threatIds:
			adversaries = json.loads(getThreatClassifications(id, "adversaries", "adv").response[0])
			assets = json.loads(getThreatClassifications(id, "assets", "asset").response[0])
			attackTypes = json.loads(getThreatClassifications(id, "attack_types", "atktyp").response[0])
			attackVectors = json.loads(getThreatClassifications(id, "attack_vectors", "atkvtr").response[0])
			vulnerabilities = json.loads(getThreatClassifications(id, "vulnerabilities", "vuln").response[0])
			threatsTable = Table('threats')
			threat = json.loads(executeQuery(Query.from_(threatsTable).select(threatsTable.threat_id, threatsTable.threat_title).where(threatsTable.threat_id == id)).response[0])

			finalThreat = {"threat":threat, "adversaries": adversaries, "assets":assets, "attack_types": attackTypes, "attack_vectors":attackVectors, "vulnerabilities":vulnerabilities}
			if finalThreat not in finalThreatsDict:
				finalThreatsDict.append(finalThreat)
		return jsonify(finalThreatsDict)
	return jsonify([])

# Determines if the threats in threatData match the user's search parameters
def extractMatchedThreats(threatData, threatIds, adversaryIds, assetIds, attackTypeIds, attackVectorIds, vulnerabilityIds, advInclusive=False, assetInclusive=False, atktypInclusive=False, atkvtrInclusive=False, vulnInclusive=False):
	finalThreatIds = []
	for tid in threatIds:
		currentThreatEntries = [x for x in threatData if x['threat_id'] in [tid]]
		addThreat = True
		if adversaryIds:
			foundCount = 0
			for advId in adversaryIds:
				for entry in currentThreatEntries:
					if entry["fk_adv_id"] == advId:
						foundCount += 1
						break
			if advInclusive:
				addThreat = True
			else:
				addThreat = (foundCount == len(adversaryIds))

		if assetIds:
			foundCount = 0
			for assetId in assetIds:
				for entry in currentThreatEntries:
					if entry["fk_asset_id"] == assetId:
						foundCount += 1
						break
			if assetInclusive:
				addThreat = True
			else:
				addThreat = (foundCount == len(assetIds))

		if attackTypeIds:
			foundCount = 0
			for attackTypeId in attackTypeIds:
				for entry in currentThreatEntries:
					if entry["fk_atktyp_id"] == attackTypeId:
						foundCount += 1
						break
			if atktypInclusive:
				addThreat = True
			else:
				addThreat = (foundCount == len(attackTypeIds))

		if attackVectorIds:
			foundCount = 0
			for attackVectorId in attackVectorIds:
				for entry in currentThreatEntries:
					if entry["fk_atkvtr_id"] == attackVectorId:
						foundCount += 1
						break
			if atkvtrInclusive:
				addThreat = True
			else:
				addThreat = (foundCount == len(attackVectorIds))

		if vulnerabilityIds:
			foundCount = 0
			for vulnerabilityId in vulnerabilityIds:
				for entry in currentThreatEntries:
					if entry["fk_vuln_id"] == vulnerabilityId:
						foundCount += 1
						break
			if vulnInclusive:
				addThreat = True
			else:
				addThreat = (foundCount == len(vulnerabilityIds))
		if (addThreat):
			finalThreatIds.append(tid)
	return finalThreatIds

# Retrieve a portion of an array
def limitOutput(array, offset=0, limit=None):
    return array[offset:(limit + offset if limit is not None else None)]

# Convert values of the same key in an associative array to a
def associativeArrayToUniqueIndexed(assocArray, key):
	unqiue_arr = [];
	for x in range(0, len(assocArray)):
		if assocArray[x][key] not in unqiue_arr:
			unqiue_arr.append(assocArray[x][key])
	return unqiue_arr;

# If the passed in array has a length greater than 0, returns the string passed in
def getStrIfArr(array, string):
	if array:
		return string
	return ""

# return a response of a table count
def getBasicCount(table):
	# CountRequest = sendGetRequest(["COUNT(*)"], [table])
	CountResponse = sendUnsafeGetRequest("SELECT COUNT(*) FROM " + table)
	return CountResponse

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

# Retrain an existing threat
def retrainThreat(id):
	trainingData = request.json["trainingData"]
	name = request.json["name"].encode(charset)
	adversaries = []
	assets = []
	attack_types = []
	attack_vectors = []
	vulnerabilities = []
	classificationArrays = {"ADVERSARY":adversaries, "ASSET":assets, "ATTACK_TYPE":attack_types, "ATTACK_VECTOR":attack_vectors, "VULNERABILITY":vulnerabilities}
	curType = "O"
	curClassifications = ""
	for record in trainingData:
		if record is not None:
			curClassifications += record[1] + " "
			if (record[1] != "O"):
				curType = appendToClassificationArr(record, curType, classificationArrays[record[1]])
			else:
				curType = "O"
	sendPutRequest("threats", "threat_id", id, {"threat_classification":curClassifications, "threat_editor":name})
	addClassificationAndXref(adversaries, "adversaries", "adv", "threat", id)
	addClassificationAndXref(assets, "assets", "asset", "threat", id)
	addClassificationAndXref(attack_vectors, "attack_vectors", "atkvtr", "threat", id)
	addClassificationAndXref(attack_types, "attack_types", "atktyp", "threat", id)
	addClassificationAndXref(vulnerabilities, "vulnerabilities", "vuln", "threat", id)
	return success()

# Post training data to the database
def postTrainingdata():
	trainingData = request.json["trainingData"]
	trainingText = request.json["trainingText"]
	trainingDescriptions = trainingText.splitlines()

	trainingIds = []

	curDescription = ""
	descriptions = []
	classifications = []
	index = 0

	newAdversaries = []
	newAssets = []
	newAttackTypes = []
	newAttackVectors = []
	newVulnerabilities = []
	for training_data in trainingData:
		adversaries = []
		assets = []
		attack_types = []
		attack_vectors = []
		vulnerabilities = []
		classificationArrays = {"ADVERSARY":adversaries, "ASSET":assets, "ATTACK_TYPE":attack_types, "ATTACK_VECTOR":attack_vectors, "VULNERABILITY":vulnerabilities}
		curType = "O"
		curClassifications = ""
		for record in training_data:
			if record is not None:
				curClassifications += record[1] + " "
				if (record[1] != "O"):
					curType = appendToClassificationArr(record, curType, classificationArrays[record[1]])
				else:
					curType = "O"
		newAdversaries.append(adversaries)
		newAssets.append(assets)
		newAttackTypes.append(attack_types)
		newAttackVectors.append(adversaries)
		newVulnerabilities.append(vulnerabilities)
		classifications.append(curClassifications)
		index += 1
	index = 0
	for description in trainingDescriptions:
		if len(description) > 0:
			description = description.encode("utf-8")
			sendPostRequest("training_data", {"train_desc":description,"train_classification":classifications[index]})
			trainingDataId = lastRowID
			addClassificationAndXref(newAdversaries[index], "adversaries", "adv", "train", trainingDataId)
			addClassificationAndXref(newAssets[index], "assets", "asset", "train", trainingDataId)
			addClassificationAndXref(newAttackVectors[index], "attack_vectors", "atkvtr", "train", trainingDataId)
			addClassificationAndXref(newAttackTypes[index], "attack_types", "atktyp", "train", trainingDataId)
			addClassificationAndXref(newVulnerabilities[index], "vulnerabilities", "vuln", "train", trainingDataId)

			index += 1
	return success()

	curType = appendElement()

# Adds a classification type and updates the xref if those don't already exist
# Note xrefTableType can be only "train" or "threat"
def addClassificationAndXref(classifications, tableName, tableShortcode, xrefTableType, rootRecordId):
	rootTableName = ""
	if (xrefTableType == "train"):
		rootTableName = "training_data"
	elif (xrefTableType == "threat"):
		rootTableName = "threats"
	# Delete previous xref records for the record type
	sendDeleteRequest(tableName + "_" + rootTableName + "_xref", {"fk_" + xrefTableType + "_id":rootRecordId})
	for classification in classifications:
			getRequestText = "select " + tableShortcode + "_id from " + tableName + " where " + tableShortcode + "_name" + "='" + classification + "'"
			request = sendUnsafeGetRequest(getRequestText)
			if (len(json.loads(request.response[0])) > 0):
				fkId = json.loads(request.response[0])[0][tableShortcode+"_id"]
			else:
				sendPostRequest(tableName, {tableShortcode + "_name":classification})
				global lastRowID
				fkId = lastRowID

			sendPostRequest(tableName + "_" + rootTableName + "_xref", {"fk_" + tableShortcode + "_id":fkId, "fk_" + xrefTableType + "_id":rootRecordId})

# Appends classification recrods onto an array. If there are multiple records of the same classification in a row, they are appended to the element in the list at the previuos index.
# record - is the classification list. ex: [0] -> "Apple", [1] -> "ASSET"
# curType - Current classification type (ASSET, ATTACK_TYPE, etc.)
def appendToClassificationArr(record, curType, array):
	if curType == record[1]:
		array[len(array)-1] += " " + record[0]
		return curType
	else:
		array.append(record[0])
		return record[1]

def calculateTokenizedText(isThreat=False):
	trainingText = request.json["trainingText"]
	lines = []
	if isThreat:
		lines.append(word_tokenize(trainingText))
	else:
		for data in trainingText.splitlines():
			# ignore newline characters
			if (len(data) == 0):
				continue
			lines.append(word_tokenize(data))
	return jsonify(lines)

# Update a threat's description
def putThreatDesc(id):
	request.json["threat_classification"] = createEmptyClassification(request.json["threat_desc"])
	sendPutRequest("threats", "threat_id", id)

# Update a threat's rating
def putThreatRatings():
	threatIds = request.json["threat_ids"]
	editor = request.json["threat_editor"].encode(charset)
	rating = request.json["threat_rating"].encode(charset)
	threats = Table('threats')
	query = Query.update(threats).set("threat_rating", rating).set("threat_editor", editor).where(threats.threat_id.isin(threatIds))
	return executeQuery(query)

# Update a threat's status
def putThreatStatuses():
	threatIds = request.json["threat_ids"]
	editor = request.json["threat_editor"].encode(charset)
	status = request.json["threat_status"].encode(charset)
	threats = Table('threats')
	query = Query.update(threats).set("threat_status", status).set("threat_editor", editor).where(threats.threat_id.isin(threatIds))
	return executeQuery(query)

# Delete a product
def deleteProduct(id):
	return sendDeleteRequest("products", {"product_id":id})

# Delete a product threat
def deleteProductThreat(pid, tid):
	threats = Table("threats")
	return executeQuery(Query.from_(threats).where(threats.threat_id == tid).where(threats.product_id == pid).delete())

# Delete a threat
def deleteThreat(id):
	threats = Table("threats")
	return executeQuery(Query.from_(threats).where(threats.threat_id == id).delete())

# Remove a threat from a user's watchlist
def removeThreatFromWatchlist(id, tid):
	usersThreats = Table("users_threats")
	return executeQuery(Query.from_(usersThreats).where(usersThreats.user_id == id).where(usersThreats.threat_id == tid).delete())

# Remove a product from a user's watchlist
def removeProductFromWatchlist(id, pid):
	usersProducts = Table("users_products")
	return executeQuery(Query.from_(usersProducts).where(usersProducts.user_id == id).where(usersProducts.product_id == pid).delete())

# Delete a feed
def deleteFeed(id):
	feeds = Table("feeds")
	return executeQuery(Query.from_(feeds).where(feeds.feed_id == id).delete())

# Delete a feed type
def deleteFeedType(id):
	feedTypes = Table("feedTypes")
	return executeQuery(Query.from_(feedTypes).where(feedTypes.type_id == id).delete())
