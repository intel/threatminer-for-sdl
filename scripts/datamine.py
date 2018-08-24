import socket
import urllib2

import feedparser
import nltk
from bs4 import BeautifulSoup
import pymysql.cursors
import pymysql
import re
import time
import datetime
import sys
import warnings
import os
import cPickle as pickle
from textblob.classifiers import NaiveBayesClassifier
from nltk.stem.porter import PorterStemmer
from stop_words import get_stop_words
from nltk.tokenize import RegexpTokenizer
import json
from classifier.classify import classifyThreatNER, classifyThreatNERAsIrrelevant

__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

# Load config.json into "config"
with open(os.path.join(__location__, 'config.json')) as f:
    config = json.load(f)["databaseConnection"]

sslFile=config["caCert"]
ssl = None
if (sslFile):
	ssl = { 'ca': os.path.join(__location__, sslFile)}

now = time.strftime("%x") #today's date

# timeout in seconds
socket.setdefaulttimeout(30)

#removes warnings from beautiful soup
warnings.filterwarnings("ignore", category=UserWarning, module='bs4')
#initializes the text tokenizer
tokenizer = RegexpTokenizer(r'\w+')
#initizializes the word stemmer
p_stemmer = PorterStemmer()
#initializes the stop words
en_stop = get_stop_words('en')

#desieralizes the classifer object created by train.py
with open('threat_classifierOntology.pkl', 'rb') as f:
    classifier = pickle.load(f)

#stems text and removes stopwords
def preProcessText(text):
	raw = text.lower()
	tokens = tokenizer.tokenize(raw)
	stopped_tokens = [i for i in tokens if not i in en_stop]
	stemmed_tokens = [p_stemmer.stem(i) for i in stopped_tokens]
	return " ".join(stemmed_tokens)

#returns either "not relevant" or "relevant"
def checkRelevance(text):
	return  classifier.classify(text)

#method to run the program
def run():
	try:
		print("Started")
		DBconnect()
		initProductsandFeeds()
		search()
		DBclose()
		print("Finished")
	except:
		file = open("OntologyErrors.txt", "w")
		error = sys.exc_info()[0].__name__ + ': ' + str(sys.exc_info()[1])
		file.write(now)
		file.write('\n')
		file.write(error)
		file.close()

#establishes a connection to the database (Credentials can be changed here)
def DBconnect():
	global conn
	conn = pymysql.connect(host=config["host"],
								   user=config["user"],
								   password=config["password"],
								   db=config["db"],
								   port=int(config["port"]),
								   ssl=ssl,
								   cursorclass=pymysql.cursors.DictCursor)

	global cursor
	cursor = conn.cursor()



#closes the DB connection
def DBclose():
	conn.close()

#initializes all feeds and products
def initProductsandFeeds():
	cursor.execute("select * from feeds")
	global feeds
	feeds = cursor.fetchall()
	cursor.execute("select * from products p, productCategories c where p.category_id=c.category_id")
	global products
	products = cursor.fetchall()


#gets keywords for specified product
def getKeywords(product):
	cursor.execute("select keyword from keywords where product_id=%s" % (str(product['product_id'])))
	global keywords
	keywords = cursor.fetchall();
	return keywords;


#returns the id of the last record added to the threats table
def getLatestThreatID():
	cursor.execute("select max(threat_id) from threats")
	fetch = cursor.fetchone()
	id = fetch['max(threat_id)']
	return id

#handles the case of a new threat being found (inserts into database)
def insert(product, title, summary, source, feed_id):
	cursor.execute("select count(*), threat_id from threats where threat_link=%s and product_id=%s" , (source, str(product['product_id'])))
	fetch = cursor.fetchone()
	rowCount = fetch['count(*)']
	processedText = preProcessText(title + " " + summary)
	relevance = checkRelevance(processedText)
	#if threat is not in the threats table
	if (rowCount == 0):
		#if the threat is determined as relevant
		if(relevance == 'relevant'):
			cursor.execute("insert ignore into threats (threat_title, threat_link, threat_desc, threat_date, threat_status, feed_id, product_id) values (%s, %s, %s, %s, %s, %s, %s)",
			(title, source, summary, now, "-New-", feed_id, str(product['product_id'])))
			conn.commit()
			classifyThreatNER(cursor.lastrowid, summary)
			try:
				cursor.execute("update products set product_updated=%s where product_id=%s", (now, str(product['product_id'])))
				conn.commit()
			except:
				pass
			try:
				cursor.execute("update products set product_emailTime=%s where product_id=%s", (datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), str(product['product_id'])))
				conn.commit()
			except:
				pass

		#if the threat is determined as irrelevant
		if(relevance == 'not_relevant'):
			cursor.execute("insert ignore into threats (threat_title, threat_link, threat_desc, threat_date, threat_status, feed_id, product_id) values (%s, %s, %s, %s, %s, %s, %s)",
			(title, source, summary, now, "-New N/A-", feed_id, str(product['product_id'])))
			conn.commit()
			classifyThreatNERAsIrrelevant(cursor.lastrowid, summary)
			try:
				cursor.execute("update products set product_updated=%s where product_id=%s", (now, str(product['product_id'])))
				conn.commit()
			except:
				pass
			try:
				cursor.execute("update products set product_emailTime=%s where product_id=%s", (datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), str(product['product_id'])))
				conn.commit()
			except:
				pass


#takes two parameters and tries to find a whole word within a string
def findWholeWord(w):
	return re.compile(r'\b({0})\b'.format(w), flags=re.IGNORECASE).search

#searches through the feeds for keywords and adds threats the corressponding tables
def search():
	#iterate through all products
	for product in products:
		hits = 0
		#get the keywords for the product
		keywords = getKeywords(product)
		#iterate through all threat feeds
		for link in feeds:

			currLink = feedparser.parse(link['feed_link'])

			if(len(currLink['entries'])==0):
				currLink = feedparser.parse(link['feed_link'])

			#iterate through all the entries in the feed
			for j in range(0,len(currLink['entries'])):
				#store the title, description and link for the current entry
				try:
					soup = BeautifulSoup(currLink['entries'][j].title, 'html.parser')
					title = soup.get_text().encode('ascii', 'ignore')
					if(len(title) > 244):
						title = title[0:244] + "..."
				except:
					title = ""
				try:
					soup = BeautifulSoup(currLink['entries'][j].summary, 'html.parser')
					desc = soup.get_text().encode('ascii', 'ignore')
					if(len(desc) > 300):
						desc = desc[0:300] + "..."
				except:
					desc = ""
				try:
					soup = BeautifulSoup(currLink['entries'][j].link, 'html.parser')
					source = soup.get_text().encode('ascii', 'ignore')
				except:
					source = ""
				#makes sure that the title is not blank
				if(title != ""):
					#look for product name in title and desc
					nameInTitle = None
					nameInDesc = None
					try:
						#tries searching the for the whole word in the title and description
						nameInTitle = findWholeWord(product['product_name'])(title)
						nameInDesc = findWholeWord(product['product_name'])(desc)

					except:
						pass

					if(nameInTitle != None or nameInDesc != None):
						hits+=1
						if(source != ""):
							insert(product, title, desc, source, link['feed_id'])
					#look for each keyword in the entry
					for word in keywords:
						wordInTitle = None
						wordInDesc = None

						try:
							#tries to find the keyword in the title and description
							wordInTitle = findWholeWord(word['keyword'])(title)
							wordInDesc = findWholeWord(word['keyword'])(desc)

						except:
							pass


						if(wordInTitle != None or wordInDesc != None):
							hits+=1
							if(source != ""):
								insert(product, title, desc, source, link['feed_id'])
		print("Hits for " + product['product_name'] + ": " + str(hits))
		print("Running...")

#run()
