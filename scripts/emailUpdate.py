import smtplib
import datetime
from datetime import timedelta
import pymysql.cursors
import pymysql
from email.mime.text import MIMEText

# Load config.json into "int(int(config["port"]))
with open("../config.json") as f:
    config = json.load(f)["databaseConnection"]

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


def getUsers():
	cursor.execute("select distinct user_id from users_products")
	userIDs = cursor.fetchall()
	return userIDs

#checks if the product was updated within the past 12 hours
def checkRecent(date):
	now = datetime.datetime.now()
	try:
		datetime_object = datetime.datetime.strptime(date, '%Y-%m-%d %H:%M:%S')
	except:
		datetime_object = None
	if datetime_object is None:
		return False
	if now-timedelta(hours=24) <= datetime_object <= now:
		return True
	else:
		return False;

def update():
	#gets all distinct users in watchlist
	UserIDs = getUsers()
	#iterates through all users who want to receive emails
	for user in UserIDs:
		message = "New potential threats found for the following ontologies: \n \n"
		#gets all watched products by the user
		cursor.execute("select * from users_products u , products p where u.user_id=%s and u.product_id=p.product_id", (user['user_id']))
		products = cursor.fetchall()
		#retrieves details about a single user
		cursor.execute("select * from users where user_id=%s", (user['user_id']))
		userDetails = cursor.fetchone()
		productCount = 0
		for product in products:
			#checks if product was updated today
			if(checkRecent(product['product_emailTime'])):
				#adds the name of the product to the email
				message = message + product['product_name']+" \n \n"
				productCount = productCount + 1
		if(productCount > 0):
			print productCount
			print message
			print userDetails['user_email']
			message = message + "threatMiner"
			sendMessage(message, userDetails['user_email'])
			productCount = 0

#composes and sends a message to a user
def sendMessage(message, email):
	msg = MIMEText(message)
	msg['Subject'] = 'Potential Threats Found'
	s = smtplib.SMTP('smtpserverhere', 587)
	s.starttls()
	#change to (your email, your password)
	s.login("yourEmailHere", "yourpasswordhere")
	#change first parameter to
	s.sendmail("myEmailingprogram@myemailprogram.com", email, msg.as_string())
	s.quit()

#method to run the program
def run():
	DBconnect()
	update()
	DBclose()

#runs the program
run()
