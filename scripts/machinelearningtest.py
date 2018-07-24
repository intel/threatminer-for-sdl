from textblob import TextBlob
from textblob.classifiers import NaiveBayesClassifier
from stop_words import get_stop_words
from nltk.tokenize import RegexpTokenizer
import cPickle as pickle
import pymysql.cursors
import time
import sys
import pymysql
from nltk.stem.porter import PorterStemmer
import json

# Load config.json into "int(int(config["port"]))
with open("../config.json") as f:
    config = json.load(f)["databaseConnection"]

#connect to the DB
def DBconnect():
	global conn
	conn = pymysql.connect(host=config["host"],
								   user=config["user"],
								   password=config["password"],
								   db=config["db"],
								   port=int(config["port"]),
								   cursorclass=pymysql.cursors.DictCursor)

	global cursor
	cursor = conn.cursor()



#closes the DB connection
def DBclose():
	conn.close()

#retreives all of the threats from the DB that are marked as training data
def getThreats():
	DBconnect()
	cursor.execute("select * from threats where (threat_status = '-Under Investigation-') or (threat_status = '-Fixed-') or (threat_status = '-Not an Issue-') or (threat_status = '-N/A-') or (threat_status = '-Advisory-')")
	threats = cursor.fetchall()
	DBclose()
	return threats

#formats the threats into a proper fromat for training
#an array of tuples [(text, relevance)]
def createTrainingData():
	trainingData = []
	threats = getThreats()
	relevance = ""
	tokenizer = RegexpTokenizer(r'\w+')
	p_stemmer = PorterStemmer()
	en_stop = get_stop_words('en')
	countRelevent=0
	countIrr=0

	for threat in threats:
		description = threat['threat_desc']
		title = threat['threat_title']
		if(threat['threat_status'] == '-Under Investigation-' or threat['threat_status'] == '-Fixed-' or threat['threat_status'] == '-Not an Issue-' or threat['threat_status'] == '-Advisory-'):
			relevance = "relevant"
			countRelevent = countRelevent + 1
		else:
			relevance = "not relevant"
			countIrr = countIrr + 1

		raw = title.lower() + " " + description.lower()
		tokens = tokenizer.tokenize(raw)
		stopped_tokens = [i for i in tokens if not i in en_stop]
		stemmed_tokens = [p_stemmer.stem(i) for i in stopped_tokens]
		trainingData.append((" ".join(stemmed_tokens), relevance))

	print countRelevent
	print countIrr
	#print trainingData

createTrainingData()
