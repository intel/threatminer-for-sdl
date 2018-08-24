from subprocess import check_output, call
from nltk.tokenize import word_tokenize
from json import load
import json
from pymysql.cursors import DictCursor
from pypika import Query, Table, Field
from pymysql import connect
from datetime import datetime
from time import time
import os

__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

# Load config.json into "config"
with open(os.path.join(__location__, '../config.json')) as f:
	config = load(f)["databaseConnection"]

host=config["host"]
user=config["user"]
password=config["password"]
db=config["db"]
port=int(config["port"])
charset=config["charset"]
cursorclass=DictCursor
sslFile=config["caCert"]
ssl = None
if (sslFile):
	ssl = { 'ca': os.path.join(__location__, '../' + sslFile)}
trainingInputFile = os.path.join(__location__, "testFile.tsv")

lastRowID = -1

# NOTE: THIS METHOD IS UNSAFE FOR USER INPUT. USE FOR ONLY INTERNAL QUERIES. USER SENDGETREQUEST OR EXECUTEQUERY FOR USER INPUT
# Get database records given a raw SQL query
# Parameters:
#  query - A query that specifically retrieves data i.e. "select *"
# Returns:
#  A flask response object: http://flask.pocoo.org/docs/0.12/api/#flask.Response
def sendUnsafeGetRequest(query):
	conn = connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
	cursor = conn.cursor()
	try:
		cursor.execute(query)
		return cursor.fetchall()
	finally:
		cursor.close()
		conn.close()

# Get database record(s)
# Parameters:
#	query - A query that specifically retrieves data i.e. "select *"
# Returns:
#	A flask response object: http://flask.pocoo.org/docs/0.12/api/#flask.Response
def sendGetRequest(query):
	try:
		conn = connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
		cursor.execute(query)
		return cursor.fetchall()
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
		conn = connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
		parsedJSON = parseJSONUnion(elements, " and ")
		cursor.execute("delete from " + tableName + " where " + parsedJSON[0], [parsedJSON[1]])
		conn.commit()
		return "Request was a success!"
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
		conn = connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
		cursor.execute(query.get_sql())
		conn.commit()
		return "Request was a success!"
	finally:
		cursor.close()
		conn.close()

# Insert new database record(s)
# Parameters:
#	tableName - database table name to send the request to
# 	elements - a dictionary of key-value pairs: {"key":"value","key","value"...}
# Returns:
# 	Result of success() method if successful
def sendPostRequest(tableName, elements):
	try:
		conn = connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
		parsedJSON = parseJSONSeparate(elements)
		cursor.execute("insert into " + tableName + " (" + parsedJSON[0] + ") " +  "values (" + parsedJSON[1] + ")")
		conn.commit()
		global lastRowID
		lastRowID = cursor.lastrowid
		return "Request was successful"
	finally:
		cursor.close()
		conn.close()

# Converts a dictionary of key-value pairs into two separate arrays of keys and values
# Parameters:
# 	elements - a dictionary of key-value pairs: {"key":"value","key","value"...}
# Returns:
# 	parses JSON into two strings:
# 		arr[0] = (key, key, key, key)
# 		arr[1] = (value, value, value, value)
def parseJSONSeparate(elements):
	requestKeys = ""
	requestValues = ""
	index = 0
	for element in elements:
		requestKeys += element
		if elements[element]:
			requestValues += '"{}"'.format(str(elements[element]).encode("utf-8"))
		else:
			requestValues += "NULL"
		if index < len(elements)-1 :
			requestKeys += ", "
			requestValues += ", "
		index += 1
	parsedJSON = ["", ""]
	parsedJSON[0] = requestKeys
	parsedJSON[1] = requestValues
	return parsedJSON

# Format data into a tabular format of n columns. Note: keys within a dictionary must all be set
# Parameters:
#	trainData[<List> of <Dict> objects] - Contains a list of dictionaries. Each dictionary must have two key-value pairs that are idential for all dictionaries in the list
#	columns[<List>] - Array of column names. The order passed in is the order of output
#	output[<Str>] - Final string to be returned
#	columnSeparator[<Str>] - Separates the columns
#	tableSeparator[<Str>] - Separates the tables
# Returns[<Str>]:
#	The formatted table
def formatListOfDictionaries(listOfDicts, columns, output = "", columnSeparator = "\t", tableSeparator = "\n"):
	for dictionary in listOfDicts:
		tokenizedColumns = []
		for column in columns:
			tokenizedColumns.append(word_tokenize(str(dictionary[column])))

		outputArr = [""] * len(tokenizedColumns[0]) 							# initialize array to the size of the number of tokens in the first column
		columnCount = 0
		for column in tokenizedColumns:											# Loop over every token of every column and format it into outputArr
			i = 0
			for token in column:
				outputArr[i] += token
				if (columnCount == len(tokenizedColumns)-1):
					outputArr[i] += "\n"
					output += outputArr[i]
				else:
					outputArr[i] += columnSeparator
				i += 1
			columnCount += 1

		output += tableSeparator
	return output.encode(config["charset"])										# Return output and encode to current charset

# Gets and formats training data
# Parameters:
#	output[<Str>] - Final string to be returned. Passing a value into output is for chaining data
# Returns[<Str>]:
#	The data in tabular format
def getTrainingData(columns, tableName, output = ""):
	columnList = ""
	columnCounter = 0
	for column in columns:
		columnList += column
		columnCounter += 1
		if (columnCounter != len(columns)):
			columnList += ", "
	if (tableName == "threats"):
		tableName += " where ((threat_classification IS NOT NULL) AND (threat_status != '-New N/A-') AND (threat_status != '-N/A-'))"
	trainingData = sendGetRequest("select " + columnList + " from " + tableName)
	return formatListOfDictionaries(trainingData, columns, output=output)

# Write a string to a file
# Parameters:
#	fileName[<Str>] - Directory of the file
#	text[<Str] - File's file extension
# Returns[<Str>]:
#	The fileName
def writeToFile(fileName, text):
	file = open(fileName, "w+")
	file.write(text)
	file.close()

# Runs the classifier, returning its output
def classify(trainingInputFile):
	return check_output(["java", "-Xmx2g", "edu.stanford.nlp.ie.crf.CRFClassifier", "-loadClassifier", os.path.join(__location__, "ner-model.ser.gz"), "-testFile", trainingInputFile], shell=False)

# Return a tokenized string that replaces tokens with "O "s
# Ex: "hello there I am writing code", it will return "0 0 0 0 0 0"
def __formatUnClassifiedTextForTSV(text):
	tokenizedText = word_tokenize(text)
	output = ""
	for word in tokenizedText:
		output += word + "\t" + "O" + "\n"
	return output

# Returns string of elements in column 3 of a TSV file. Each element is separated by a space.
def __getClassificationsFromTSV(text):
	lines = text.splitlines()
	output = ""
	for x in range(0, len(lines)-1):
		output += lines[x].split("\t")[2] + " "
	return output

# Returns array of elements in column 1 of a TSV file
def __getWordArrayFromTSV(text):
	lines = text.splitlines()
	output = []
	for x in range(0, len(lines)-1):
		output.append(lines[x].split("\t")[0])
	return output

# Returns array of elements in column 3 of a TSV file
def __getClassificationsArrayFromTSV(text):
	lines = text.splitlines()
	output = []
	for x in range(0, len(lines)-1):
		output.append(lines[x].split("\t")[2])
	return output

# Parses JSON into a string: "key=value<separator>key=value<separator>key=value..."
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

# Adds a classification type and updates the xref if those don't already exist
def addClassificationAndXref(classifications, tableName, tableShortcode, rootRecordId):
	# Delete previous xref records for the record type
	sendDeleteRequest(tableName + "_threats_xref", {"fk_threat_id":rootRecordId})
	for classification in classifications:
			getRequestText = "select " + tableShortcode + "_id from " + tableName + " where " + tableShortcode + "_name" + "='" + classification + "'"
			request = sendUnsafeGetRequest(getRequestText)
			if (len(request) > 0):
				fkId = request[0][tableShortcode+"_id"]
			else:
				sendPostRequest(tableName, {tableShortcode + "_name":classification})
				global lastRowID
				fkId = lastRowID

			sendPostRequest(tableName + "_threats_xref", {"fk_" + tableShortcode + "_id":fkId, "fk_threat_id":rootRecordId})

# Appends classification records onto an array. If there are multiple records of the same classification in a row, they are appended to the element in the list at the previous index.
# record - is the classification list. ex: [0] -> "Apple", [1] -> "ASSET"
# curType - Current classification type (ASSET, ATTACK_TYPE, etc.)
def appendToClassificationArr(record, curType, array):
	if curType == record[1]:
		array[len(array)-1] += " " + record[0]
		return curType
	else:
		array.append(record[0])
		return record[1]

# Trains a specific threat
def trainThreat(id, trainingData):
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

	addClassificationAndXref(adversaries, "adversaries", "adv", id)
	addClassificationAndXref(assets, "assets", "asset", id)
	addClassificationAndXref(attack_vectors, "attack_vectors", "atkvtr", id)
	addClassificationAndXref(attack_types, "attack_types", "atktyp", id)
	addClassificationAndXref(vulnerabilities, "vulnerabilities", "vuln", id)

# Fills the threat_classification field of a threat with the result of NER Classification
def classifyThreatNER(threatId, threatDesc):
	writeToFile(os.path.join(__location__, "tempThreatData.tsv"), __formatUnClassifiedTextForTSV(threatDesc))
	classifiedText = classify(os.path.join(__location__, "tempThreatData.tsv"))
	classification = __getClassificationsFromTSV(classifiedText)
	threats = Table('threats')
	executeQuery(Query.update(threats).set('threat_classification', classification).where(threats.threat_id == threatId))
	wordArray = __getWordArrayFromTSV(classifiedText)
	classificationArray = __getClassificationsArrayFromTSV(classifiedText)
	classificationTypesArray = []
	for x in range(0, len(classificationArray)-1):
		classificationTypesArray.append([wordArray[x], classificationArray[x]])
	trainThreat(threatId, classificationTypesArray)

# Fills the threat_classification field of a threat with tokenized zeros to train NER to ignore this type of data
def classifyThreatNERAsIrrelevant(threatId, threatDesc):
	classification = "O " * len(word_tokenize(threatDesc))
	threats = Table('threats')
	executeQuery(Query.update(threats).set('threat_classification', classification).where(threats.threat_id == threatId))

# Entry point for training the NER Model
def trainNER():
	genericTrainingData = getTrainingData(["train_desc", "train_classification"], "training_data")
	allTrainingData = getTrainingData(["threat_desc", "threat_classification"], "threats", output=genericTrainingData)
	writeToFile(os.path.join(__location__, "tempTrainingData.tsv"), allTrainingData)
	call(["java", "-Xmx2g", "edu.stanford.nlp.ie.crf.CRFClassifier", "-prop", os.path.join(__location__, "configuration.prop"), "-trainFile", os.path.join(__location__, "tempTrainingData.tsv")], shell=False)
