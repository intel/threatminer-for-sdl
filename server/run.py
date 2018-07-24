from flask import Flask, jsonify, request
from flask_jwt import JWT, jwt_required, current_identity
from werkzeug.security import safe_str_cmp
from flask_cors import CORS
from restMethods import *
from flask_httpauth import *
import os
import sys
import json
import bcrypt
import datetime

JWT_EXPIRATION_DELTA = 1

app = Flask(__name__)
app.config['JWT_EXPIRATION_DELTA'] = datetime.timedelta(days=5)
CORS(app)

auth = HTTPBasicAuth()

class User(object):
    def __init__(self, id, username, password, firstName, lastName, role, email):
        self.id = id
        self.username = username
        self.password = password
        self.firstName = firstName
        self.lastName = lastName
        self.role = role
        self.email = email

    def __str__(self):
        return "User(id='%s')" % self.id

def authenticate(username, password):
    # Get the user from the database to confirm his/her password
    user = sendGetRequest(["*"], ["users"], {"user_username":username})
    # convert json reponse from string to json object
    rawJson = json.loads(user.response[0])[0]
    # check if the hashed password in the database equals the password entered by the user
    if user and bcrypt.checkpw(password.encode('utf-8'), rawJson["user_password"].encode('utf-8')):
        return User(rawJson["user_id"], rawJson["user_username"], rawJson["user_password"], rawJson["user_firstName"], rawJson["user_role"], rawJson["user_lastName"], rawJson["user_email"])

def identity(payload):
    user = sendGetRequest(["*"], ["users"], {"user_id":str(payload['identity'])})
    return user.response[0]

app.debug = True
app.config['SECRET_KEY'] = 'super-secret'

jwt = JWT(app, authenticate, identity)

'''
GET - BROWSE
'''
#returns all users
@app.route('/users', methods=['GET'])
@jwt_required()
def returnUsers():
	try:
		return sendGetRequest(["*"], ["users"])
	except:
		return error()


# returns all ontologies in the Pen Test Arsenal category
@app.route('/pentest', methods=['GET'])
@jwt_required()
def returnPentest():
	try:
		return sendGetRequest(["*"], ["products p", "productCategories c"], andConditions=["p.category_id = c.category_id", "c.category_name='PenTest Arsenal'"], andOnFirst=False)
	except:
		return error()

#returns all products
@app.route('/products', methods=['GET'])
@jwt_required()
def returnProducts():
	try:
		return sendGetRequest(["*"], ["products p", "productCategories c"], andConditions=["p.category_id=c.category_id", "(c.category_name not like 'PenTest Arsenal')", "(c.category_name not like 'Open Source - Whitelist')", "(c.category_name not like '3rd Party COTS - Whitelist')", "(c.category_name not like '3rd Party COTS - Conditional')", "(c.category_name not like 'Open Source - Conditional')"], andOnFirst=False)
	except:
		return error()

#returns all feeds
@app.route('/feeds', methods=['GET'])
@jwt_required()
def returnFeeds():
	try:
		return sendGetRequest(["*"], ["feeds f", "feedTypes t"], andConditions=["f.feed_type = t.type_id"], andOnFirst=False)
	except:
		return error()

#returns all adversaries
@app.route('/adversaries', methods=['GET'])
@jwt_required()
def returnAdversaries():
	try:
		return sendGetRequest(["*"], ["adversaries"])
	except:
		return error()

#returns all product categories
@app.route('/productCategories', methods=['GET'])
@jwt_required()
def returnCategories():
	try:
		return sendGetRequest(["*"], ["productCategories"])
	except:
		return error()

#returns all threat categories
@app.route('/threatCategories', methods=['GET'])
@jwt_required()
def getThreatTypes():
	try:
		return sendGetRequest(["*"], ["threatCategories"])
	except:
		return error()

#returns all feed types
@app.route('/feedTypes', methods=['GET'])
@jwt_required()
def getTypesofFeeds():
	try:
		return sendGetRequest(["*"], ["feedTypes"])
	except:
		return error()

'''
GET - QUERY
'''
#add a new user
@app.route('/users/hasUsers', methods=['GET'])
def returnhasUsers():
	try:
		return hasUsers()
	except:
		return error()

#returns keywords for a product
@app.route('/products/<int:id>/keywords', methods=['GET'])
@jwt_required()
def returnProductKeywords(id):
	try:
		return sendGetRequest(["*"], ["keywords"], {"product_id":str(id)})
	except:
		return error()

#returns threats for a product
@app.route('/products/<int:id>/threats', methods=['GET'])
@jwt_required()
def returnProductThreats(id):
	try:
		return sendGetRequest(["*"], ["threats"], {"product_id":str(id)})
	except:
		return error()

#return all products affected by a threat
@app.route('/threats/<int:id>/affected', methods=['GET'])
@jwt_required()
def returnAffectedProducts(id):
	try:
		return sendGetRequest(["p1.*"], ["products p1", "threats t1", "threats t2"], {"t1.threat_id":str(id)}, ["t1.threat_link=t2.threat_link", "t2.product_id = p1.product_Id"])
	except:
		return error()

#return saved threats for a user
@app.route('/<int:id>/savedThreats', methods=['GET'])
@jwt_required()
def returnSavedThreats(id):
	try:
		return sendGetRequest(["*"], ["threats t", "users_threats ut"], {"ut.user_id":str(id)}, ["t.threat_id=ut.threat_id"])
	except:
		return error()

#return saved products for a user
@app.route('/<int:id>/savedProducts', methods=['GET'])
@jwt_required()
def returnSavedProducts(id):
	try:
		return sendGetRequest(["*"], ["products p", "users_products up"], {"up.user_id":str(id)}, ["p.product_id=up.product_id"])
	except:
		return error()

'''
GET - READ
'''

#return one user
@app.route('/users/<int:id>', methods=['GET'])
@jwt_required()
def returnAUser(id):
	try:
		return sendGetRequest(["*"], ["users"], {"user_id":str(id)})
	except:
		return error()

#return one product
@app.route('/products/<int:id>', methods=['GET'])
@jwt_required()
def returnAProduct(id):
	try:
		return sendGetRequest(["*"], ["products p", "productCategories c"], {"product_id":str(id)}, ["p.category_id = c.category_id"])
	except:
		return error()

#return one feed
@app.route('/feeds/<int:id>', methods=['GET'])
@jwt_required()
def returnAFeed(id):
	try:
		return sendGetRequest(["*"], ["feeds"], {"feed_id":str(id)})
	except:
		return error()

#return one threat
@app.route('/threats/<int:id>', methods=['GET'])
@jwt_required()
def returnAThreat(id):
	try:
		return sendGetRequest(["*"], ["threats"], {"threat_id":str(id)})
	except:
		return error()

#return one adversary
@app.route('/adversaries/<int:id>', methods=['GET'])
@jwt_required()
def returnAnAdversary(id):
	try:
		return sendGetRequest(["*"], ["adversaries"], {"adv_id":str(id)})
	except:
		return error()

#return one product category
@app.route('/productCategories/<int:id>', methods=['GET'])
@jwt_required()
def returnACategory(id):
	try:
		return sendGetRequest(["*"], ["productCategories"], {"category_id":str(id)})
	except:
		return error()

#return one threat category
@app.route('/threatCategories/<int:id>', methods=['GET'])
@jwt_required()
def returnAThreatCategory(id):
	try:
		return sendGetRequest(["*"], ["threatCategories"], {"category_id":str(id)})
	except:
		return error()

#get a feed type
@app.route('/feedTypes/<int:id>', methods=['GET'])
@jwt_required()
def getOneFeedType(id):
	try:
		return sendGetRequest(["*"], ["feedTypes"], {"type_id":str(id)})
	except:
		return error()

'''
GET - QUERY
'''

#get a count of number of threats in the databse
@app.route('/threats/pageCount', methods=['GET'])
@jwt_required()
def returnThreatPageCount():
	try:
		return getThreatPageCount()
	except:
		return error()

#get a count of number of threats in the databse
@app.route('/threats/pageCount/desc/<string:desc>', methods=['GET'])
@jwt_required()
def returnThreatDescPageCount(desc):
	try:
		return getThreatPageCount(desc=desc)
	except:
		return error()

#get a count of number of threats in the databse
@app.route('/threats/pageCount/title/<string:title>', methods=['GET'])
@jwt_required()
def returnThreatTitlePageCount(title):
	try:
		return getThreatPageCount(title=title)
	except:
		return error()

#get a threat query
@app.route('/threats/desc/<string:desc>/currentPage/<int:currentPage>', methods=['GET'])
@jwt_required()
def returnThreatQueryDesc(desc, currentPage):
	try:
		return getThreatQuery(currentPage, desc=desc)
	except:
		return error()

#get a threat query
@app.route('/threats/title/<string:title>/currentPage/<int:currentPage>', methods=['GET'])
@jwt_required()
def returnThreatQueryTitle(title, currentPage):
	try:
		return getThreatQuery(currentPage, title=title)
	except:
		return error()

#get a threat query
@app.route('/threats/currentPage/<int:currentPage>', methods=['GET'])
@jwt_required()
def returnThreatQuery(currentPage):
	try:
		return getThreatQuery(currentPage)
	except:
		return error()

'''
POST
'''
#add a new user
@app.route('/users/firstUser', methods=['POST'])
def addFirstUser():
	try:
		return postFirstUser()
	except:
		return error()

#add a new user
@app.route('/users', methods=['POST'])
@jwt_required()
def addUser():
	try:
		return postNewUser()
	except:
		return error()

#add a new feed
@app.route('/feeds', methods=['POST'])
@jwt_required()
def addFeed():
	try:
		return sendPostRequest("feeds")
	except:
		return error()

#add a new feed type
@app.route('/feedTypes', methods=['POST'])
@jwt_required()
def addFeedType():
	try:
		return sendPostRequest("feedTypes")
	except:
		return error()

#add a new adversary
@app.route('/adversaries', methods=['POST'])
@jwt_required()
def addAdversary():
	try:
		return sendPostRequest("adversaries")
	except:
		return error()

#add a new product
@app.route('/products', methods=['POST'])
@jwt_required()
def addProduct():
	try:
		return postProduct()
	except:
		return error()

#add a new product category
@app.route('/productCategories', methods=['POST'])
@jwt_required()
def addCategory():
	try:
		return sendPostRequest("productCategories")
	except:
		return error()

#add a new threat category
@app.route('/threatCategories', methods=['POST'])
@jwt_required()
def addThreatCategory():
	try:
		return sendPostRequest("threatCategories")
	except:
		return error()


#add a new keyword for a product
@app.route('/products/<int:id>/keywords', methods=['POST'])
@jwt_required()
def addProductKeyword(id):
	try:
		return postProductKeyword(id)
	except:
		return error()

#add a new threat for a product
@app.route('/products/<int:id>/threats', methods=['POST'])
@jwt_required()
def addProductThreat(id):
	try:
		return postProductThreat(id)
	except:
		return error()

#save a product
@app.route('/<int:id>/savedProducts', methods=['POST'])
@jwt_required()
def saveProduct(id):
	try:
		return postSavedProduct(id)
	except:
		return error()

#save a threat
@app.route('/<int:id>/savedThreats', methods=['POST'])
@jwt_required()
def saveThreat(id):
	try:
		return postSavedThreat(id)
	except:
		return error()

'''
DELETE
'''
#delete  user
@app.route('/users/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAUser(id):
	try:
		return sendDeleteRequest("users", {"user_id":id})
	except:
		return error()

#delete all of a product's keywords
@app.route('/products/<int:id>/keywords', methods=['DELETE'])
@jwt_required()
def deleteAllKeywords(id):
	try:
		return sendDeleteRequest("keywords", {"product_id":id})
	except:
		return error()

#delete a product
@app.route('/products/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAProduct(id):
	try:
		return sendDeleteRequest("products", {"product_id":id})
	except:
		return error()

#delete a feed
@app.route('/feeds/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAFeed(id):
	try:
		return sendDeleteRequest("feeds", {"feed_id":id})
	except:
		return error()

#delete an adversary
@app.route('/adversaries/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAAdversary(id):
	try:
		return sendDeleteRequest("adversaries", {"adv_id":id})
	except:
		return error()

#delete a  product category
@app.route('/productCategories/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteACategory(id):
	try:
		return sendDeleteRequest("productCategories", {"category_id":id})
	except:
		return error()

#delete a threat category
@app.route('/threatCategories/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAThreatCategory(id):
	try:
		return sendDeleteRequest("threatCategories", {"category_id":id})
	except:
		return error()

#delete a threat
@app.route('/threats/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAThreat(id):
	try:
		return sendDeleteRequest("threats", {"threat_id":id})
	except:
		return error()

#delete a product's keyword
@app.route('/products/<int:pid>/keywords/<int:kid>', methods=['DELETE'])
@jwt_required()
def deleteAProductKeyword(pid, kid):
	try:
		return sendUnsafeGetRequest("delete from keywords where keyword_id=" + str(kid) + " and product_id=" + str(pid))
	except:
		return error()

#delete a product's threat
@app.route('/products/<int:pid>/threats/<int:tid>', methods=['DELETE'])
@jwt_required()
def deleteAProductThreat(pid, tid):
	try:
		return sendUnsafeGetRequest("delete from threats where threat_id=" + str(tid) + " and product_id=" + str(pid))
	except:
		return error()

#delete a feed type
@app.route('/feedTypes/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteOneFeedType(id):
	try:
		return sendDeleteRequest("feedTypes", {"type_id":id})
	except:
		return error()
#delete a saved product (remove from watchlist)
@app.route('/<int:id>/savedProducts/<int:pid>', methods=['DELETE'])
@jwt_required()
def deleteOneSavedProduct(id, pid):
	try:
		return sendUnsafeGetRequest("delete from users_products where user_id=" + str(id) + " and product_id=" + str(pid))
	except:
		return error()

#delete a saved product (remove from watchlist)
@app.route('/<int:id>/savedThreats/<int:tid>', methods=['DELETE'])
@jwt_required()
def deleteOneSavedThreat(id, tid):
	try:
		return sendUnsafeGetRequest("delete from users_threats where user_id=" + str(id) + " and threat_id=" + str(tid))
	except:
		return error()

'''
PUT
'''
#update a feed
@app.route('/feed/<int:id>', methods=['PUT'])
@jwt_required()
def updateFeed(id):
	try:
		return sendPutRequest("feeds", "feed_id", id)
	except:
		return error()

#update a product's name
@app.route('/products/<int:id>/name', methods=['PUT'])

#update a product's description
@app.route('/products/<int:id>/desc', methods=['PUT'])

#update a product's category
@app.route('/products/<int:id>/category', methods=['PUT'])
@jwt_required()
def updateProduct(id):
	try:
		return sendPutRequest("products", "product_id", id)
	except:
		return error()

#updates a threat's description
@app.route('/threats/<int:id>/desc', methods=['PUT'])
@jwt_required()
def updateThreatDesc(id):
	try:
		return putThreatDesc(id)
	except:
		return error()

#update a threat's title
@app.route('/threats/<int:id>/title', methods=['PUT'])

#update a threat's link
@app.route('/threats/<int:id>/link', methods=['PUT'])

#update a threat's status
@app.route('/threats/<int:id>/status', methods=['PUT'])

#update a threat's rating
@app.route('/threats/<int:id>/rating', methods=['PUT'])

#update a threat's owner
@app.route('/threats/<int:id>/owner', methods=['PUT'])

#update a threat's note
@app.route('/threats/<int:id>/note', methods=['PUT'])

#update a threat's category
@app.route('/threats/<int:id>/category', methods=['PUT'])

#update a threat's adversary
@app.route('/threats/<int:id>/adversary', methods=['PUT'])
@jwt_required()
def updateThreat(id):
	try:
		return sendPutRequest("threats", "threat_id", id)
	except:
		return error()

#update a user's role
@app.route('/users/<int:id>/role', methods=['PUT'])
@jwt_required()
def updateUserRole(id):
	try:
		return sendPutRequest("users", "user_id", id)
	except:
		return error()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) #debug=True)
