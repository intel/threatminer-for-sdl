import socket
import urllib2

import feedparser
from bs4 import BeautifulSoup
import pymysql.cursors
import pymysql
import re
import time
import datetime
import sys
import RAKE
import warnings
import urllib, json
import pymysql
from urllib2 import urlopen
import cPickle as pickle
from textblob.classifiers import NaiveBayesClassifier
from nltk.stem.porter import PorterStemmer
from stop_words import get_stop_words
from nltk.tokenize import RegexpTokenizer

# Load config.json into "config"
with open("../config.json") as f:
    config = json.load(f)["databaseConnection"]

# timeout in seconds
socket.setdefaulttimeout(30)

#prevents warnings from beautiful soup
warnings.filterwarnings("ignore", category=UserWarning, module='bs4')
#initializes the text tokenizer
tokenizer = RegexpTokenizer(r'\w+')
#initialized the word stemmer
p_stemmer = PorterStemmer()
#initializes stop words
en_stop = get_stop_words('en')
#initializes rake
Rake = RAKE.Rake(get_stop_words('en'));

#desieralizes the classifer object created by train.py
with open('threat_classifierDependencies.pkl', 'rb') as f:
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
	return classifier.classify(text)

#returns a string of the most important words in a
#piece of text
def getImportantWords(text):
	list =  Rake.run(text);
	importantWordString = ""
	for word in list:
		importantWordString = importantWordString + " " + word[0]
	return importantWordString

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
		file = open("DependencyErrors.txt", "w")
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
								   cursorclass=pymysql.cursors.DictCursor)

	global cursor
	cursor = conn.cursor()

#closes the DB connection
def DBclose():
	conn.close()

#parses JSON data
def get_jsonparsed_data(url):
	response = urlopen(url)
	data = response.read()
	return json.loads(data)

#initializes all feeds and ontologies
def initProductsandFeeds():
	global now
	now = time.strftime("%x") #today's date
	#cursor.execute("select * from feeds")
	cursor.execute("select * from feeds where feed_title='NVD CVE'")
	global feeds
	feeds = cursor.fetchall()
	cursor.execute("select * from products p , productCategories c  where p.category_id = c.category_id and (c.category_name='3rd Party COTS - Whitelist' or c.category_name='Open Source - Whitelist')")
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
	if rowCount == 0:
		#if determined as relevant
		if(relevance == 'relevant'):
			cursor.execute("insert ignore into threats (threat_title, threat_link, threat_desc, threat_date, threat_status, feed_id, product_id) values (%s, %s, %s, %s, %s, %s, %s)",
			(title, source, summary, now, "-New-", feed_id, str(product['product_id'])))
			conn.commit()
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
		#if determined as not relevant
		if(relevance == 'not_relevant'):
			cursor.execute("insert ignore into threats (threat_title, threat_link, threat_desc, threat_date, threat_status, feed_id, product_id) values (%s, %s, %s, %s, %s, %s, %s)",
			(title, source, summary, now, "-New N/A-", feed_id, str(product['product_id'])))
			conn.commit()
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

#a method that takes 2 parameters. Checks if a whole word exists in a string
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

				if(title != ""):
					#look for product name in title and desc
					nameFound= None
					importantWords = getImportantWords(title + " " + desc)
					try:
						#check if its in the returned string of important words
						nameFound = findWholeWord(product['product_name'])(importantWords)
					except:
						pass

					if(nameFound != None):
						hits+=1
						if(source != ""):
							insert(product, title, desc, source, link['feed_id'])
					#look for each keyword in the entry
					for word in keywords:
						wordFound = None
						try:
							wordFound = findWholeWord(word['keyword'])(importantWords)
						except:
							pass

						#if the word was found in the string of important words
						if(wordFound != None):
							hits+=1
							if(source != ""):
								insert(product, title, desc, source, link['feed_id'])
		print("Hits for " + product['product_name'] + ": " + str(hits))
		print("Running...")

run()
