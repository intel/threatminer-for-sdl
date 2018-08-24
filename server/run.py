from flask import Flask, jsonify, request
from flask_jwt import JWT, jwt_required, current_identity
from werkzeug.security import safe_str_cmp
from flask_cors import CORS
from scripts.restMethods import *
from scripts.flask_httpauth import *
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
#add a new user
@app.route('/users/hasUsers', methods=['GET'])
def returnhasUsers():
	try:
		return hasUsers()
	except:
		return error()

#returns all users
@app.route('/users', methods=['GET'])
@jwt_required()
def returnUsers():
	try:
		return sendGetRequest(["*"], ["users"])
	except:
		return error()

#returns all products
@app.route('/products', methods=['GET'])
def returnProducts():
	try:
		return sendGetRequest(["*"], ["products p", "productCategories c"], andConditions=["p.category_id=c.category_id"], andOnFirst=False)
	except:
		return error()

#returns all feeds
@app.route('/feeds', methods=['GET'])
def returnFeeds():
	try:
		return sendGetRequest(["*"], ["feeds f", "feedTypes t"], andConditions=["f.feed_type = t.type_id"], andOnFirst=False)
	except:
		return error()

#returns all adversaries
@app.route('/adversaries', methods=['GET'])
def returnAdversaries():
	try:
		return sendGetRequest(["*"], ["adversaries"])
	except:
		return error()

#returns all assets
@app.route('/assets', methods=['GET'])
def returnAssets():
	try:
		return sendGetRequest(["*"], ["assets"])
	except:
		return error()

#returns all attack_types
@app.route('/attack_types', methods=['GET'])
def returnAttackTypes():
	try:
		return sendGetRequest(["*"], ["attack_types"])
	except:
		return error()

#returns all attack_vectors
@app.route('/attack_vectors', methods=['GET'])
def returnAttackVectors():
	try:
		return sendGetRequest(["*"], ["attack_vectors"])
	except:
		return error()

#returns all vulnerabilities
@app.route('/vulnerabilities', methods=['GET'])
def returnVulnerabilities():
	try:
		return sendGetRequest(["*"], ["vulnerabilities"])
	except:
		return error()

#returns all product categories
@app.route('/productCategories', methods=['GET'])
def returnCategories():
	try:
		return sendGetRequest(["*"], ["productCategories"])
	except:
		return error()

#returns all feed types
@app.route('/feedTypes', methods=['GET'])
def getTypesofFeeds():
	try:
		return sendGetRequest(["*"], ["feedTypes"])
	except:
		return error()

'''
GET - QUERY
'''

#returns keywords for a product
@app.route('/products/<int:id>/keywords', methods=['GET'])
def returnProductKeywords(id):
	try:
		return sendGetRequest(["*"], ["keywords"], {"product_id":str(id)})
	except:
		return error()

#returns threats for a product
@app.route('/products/<int:id>/threats', methods=['GET'])
def returnProductThreats(id):
	try:
		return sendGetRequest(["*"], ["threats"], {"product_id":str(id)})
	except:
		return error()

#return all products affected by a threat
@app.route('/threats/<int:id>/affected', methods=['GET'])
def returnAffectedProducts(id):
	try:
		return sendGetRequest(["p1.*"], ["products p1", "threats t1", "threats t2"], {"t1.threat_id":str(id)}, ["t1.threat_link=t2.threat_link", "t2.product_id = p1.product_Id"])
	except:
		return error()

@app.route('/threats/<int:id>/entities', methods=['GET'])
def returnThreatEntities(id):
	try:
		return getThreatEntities(id)
	except:
		return error()

@app.route('/threats/<int:id>/adversaries', methods=['GET'])
def returnThreatAdversaries(id):
	try:
		return getThreatClassifications(id, "adversaries", "adv")
	except:
		return error()

@app.route('/threats/<int:id>/assets', methods=['GET'])
def returnThreatAssets(id):
	try:
		return getThreatClassifications(id, "assets", "asset")
	except:
		return error()

@app.route('/threats/<int:id>/attack_types', methods=['GET'])
def returnThreatAttackTypes(id):
	try:
		return getThreatClassifications(id, "attack_types", "atktyp")
	except:
		return error()

@app.route('/threats/<int:id>/attack_vectors', methods=['GET'])
def returnThreatAttackVectors(id):
	try:
		return getThreatClassifications(id, "attack_vectors", "atkvtr")
	except:
		return error()

@app.route('/threats/<int:id>/vulnerabilities', methods=['GET'])
def returnThreatVulnerabilities(id):
	try:
		return getThreatClassifications(id, "vulnerabilities", "vuln")
	except:
		return error()

#return saved threats for a user
@app.route('/<int:id>/savedThreats', methods=['GET'])
def returnSavedThreats(id):
	try:
		return sendGetRequest(["*"], ["threats t", "users_threats ut"], {"ut.user_id":str(id)}, ["t.threat_id=ut.threat_id"])
	except:
		return error()

#return saved products for a user
@app.route('/<int:id>/savedProducts', methods=['GET'])
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
def returnAUser(id):
	try:
		return sendGetRequest(["*"], ["users"], {"user_id":str(id)})
	except:
		return error()

#return one product
@app.route('/products/<int:id>', methods=['GET'])
def returnAProduct(id):
	try:
		return sendGetRequest(["*"], ["products p", "productCategories c"], {"product_id":str(id)}, ["p.category_id = c.category_id"])
	except:
		return error()

#return one feed
@app.route('/feeds/<int:id>', methods=['GET'])
def returnAFeed(id):
	try:
		return sendGetRequest(["*"], ["feeds"], {"feed_id":str(id)})
	except:
		return error()

#return one threat
@app.route('/threats/<int:id>', methods=['GET'])
def returnAThreat(id):
	try:
		return sendGetRequest(["*"], ["threats"], {"threat_id":str(id)})
	except:
		return error()

#return one adversary
@app.route('/adversaries/<int:id>', methods=['GET'])
def returnAnAdversary(id):
	try:
		return sendGetRequest(["*"], ["adversaries"], {"adv_id":str(id)})
	except:
		return error()

#return one product category
@app.route('/productCategories/<int:id>', methods=['GET'])
def returnACategory(id):
	try:
		return sendGetRequest(["*"], ["productCategories"], {"category_id":str(id)})
	except:
		return error()

#get a feed type
@app.route('/feedTypes/<int:id>', methods=['GET'])
def getOneFeedType(id):
	try:
		return sendGetRequest(["*"], ["feedTypes"], {"type_id":str(id)})
	except:
		return error()

'''
GET - COUNT
'''

#return count of assets
@app.route('/count/assets', methods=['GET'])
def returnAssetsCount():
	try:
		return getBasicCount("assets")
	except:
		return error()

#return count of attack types
@app.route('/count/attackTypes', methods=['GET'])
def returnAttackCount():
	try:
		return getBasicCount("attack_types")
	except:
		return error()

#return count of adversaries
@app.route('/count/adversaries', methods=['GET'])
def returnAttackerCount():
	try:
		return getBasicCount("adversaries")
	except:
		return error()

#return count of attack vectors
@app.route('/count/attackVectors', methods=['GET'])
def returnVectorsCount():
	try:
		return getBasicCount("attack_vectors")
	except:
		return error()

#return count of vulnerabilities TODO
@app.route('/count/vulnerabilities', methods=['GET'])
def returnVulnerabilitiesCount():
	try:
		return getBasicCount("vulnerabilities")
	except:
		return error()

#return count of products
@app.route('/count/products', methods=['GET'])
def returnProductCount():
	try:
		return sendUnsafeGetRequest("SELECT COUNT(*) from products p, productCategories c WHERE p.category_id=c.category_id")
	except:
		return error()

#return count of threat feeds
@app.route('/count/threatFeeds', methods=['GET'])
def returnThreatFeedsCount():
	try:
		return getBasicCount("feeds")
	except:
		return error()

#return count of users
@app.route('/count/users', methods=['GET'])
def returnUserCount():
	try:
		return getBasicCount("users")
	except:
		return error()

#return response for count of threats for a feed given its id
@app.route('/count/threatActivity/<int:id>', methods=['GET'])
def returnFeedThreatCount(id):
	try:
		return sendUnsafeGetRequest("select count(*) from threats t where t.feed_id=id and ((t.threat_status not like \"-N/A-\") and (t.threat_status not like \"-New N/A-\"))")
	except:
		return error()


#return all-time count of threat activity per each feed
@app.route('/count/feeds', methods=['GET'])
def returnFeedsCount():
	try:
		return sendUnsafeGetRequest("SELECT feeds.feed_title, COUNT(threats.feed_id) AS feed_count FROM feeds LEFT JOIN threats on feeds.feed_id = threats.feed_id where (threats.threat_status not like \"-N/A-\") and (threats.threat_status not like \"-New N/A-\") GROUP BY feeds.feed_id, feeds.feed_title")
	except:
		return error()

#return count of threat activity per each feed given a range
@app.route('/count/feeds/<string:start>/<string:end>', methods=['GET'])
def returnFeedsDatedCount(start, end):
	try:
		return sendUnsafeGetRequest("SELECT feeds.feed_title, COUNT(threats.feed_id) AS feed_count FROM feeds LEFT JOIN threats on feeds.feed_id = threats.feed_id where (threats.threat_status not like \"-N/A-\") and (threats.threat_status not like \"-New N/A-\") AND str_to_date(threats.threat_date, \'%m/%d/%Y\')" +
		"between str_to_date(\'" + start.replace("-","/") + "\', \'%m/%d/%Y\') and str_to_date(\'" + end.replace("-","/") + "\', \'%m/%d/%Y\') GROUP BY feeds.feed_id, feeds.feed_title")
	except:
		return error()

#return counts of the assets, attack_types, adversaries, attack_vectors, and vulnerabilities tables. NOTE: this is hardcoded explicitly for the bar graph!
@app.route('/count/bar-graph', methods=['GET'])
def returnBarGraphData():
	try:
		return sendUnsafeGetRequest("SELECT '" + db + "/assets' AS NAME, COUNT(*) AS NUM_ROWS FROM assets UNION " +
									"SELECT '" + db + "/attack_types' AS NAME, COUNT(*) AS NUM_ROWS FROM attack_types UNION " +
									"SELECT '" + db + "/adversaries' AS NAME, COUNT(*) AS NUM_ROWS FROM adversaries UNION " +
									"SELECT '" + db + "/attack_vectors' AS NAME, COUNT(*) AS NUM_ROWS FROM attack_vectors UNION " +
									"SELECT '" + db + "/vulnerabilities' AS NAME, COUNT(*) AS NUM_ROWS FROM vulnerabilities")
	except:
		return error()


'''
GET - QUERY
'''
#get all threats in the databse
@app.route('/count/threats', methods=['GET'])
def returnThreatCount():
	try:
		return sendUnsafeGetRequest("SELECT threats.threat_date, COUNT(threats.threat_date) AS threat_count FROM threats where (threat_status not like \"-N/A-\") and (threat_status not like \"-New N/A-\") GROUP BY threats.threat_date ORDER BY threats.threat_id")
	except:
		return error()


#get all threats on a certain date in the databse
@app.route('/count/threats/<string:start>/<string:end>', methods=['GET'])
def returnDateThreatCount(start, end):
	try:
		return sendUnsafeGetRequest("SELECT threats.threat_date, COUNT(threats.threat_date) AS threat_count FROM threats where (threats.threat_status not like \"-N/A-\") and (threats.threat_status not like \"-New N/A-\") AND str_to_date(threats.threat_date, \'%m/%d/%Y\') " +
									"between str_to_date(\'" + start.replace("-","/") + "\', \'%m/%d/%Y\') and str_to_date(\'" + end.replace("-","/") + "\', \'%m/%d/%Y\') GROUP BY threats.threat_date ORDER BY threats.threat_id")
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

#get a count of number of threats in the databse
@app.route('/threats/pageCount/<string:type>', methods=['POST'])
def returnThreatPageCount(type):
	try:
		return getThreatPageCount(type)
	except:
		return error()

#get a paginated threat query
@app.route('/threats/currentPage/<int:currentPage>/type/<string:type>', methods=['POST'])
def returnThreatQuery(currentPage, type):
	try:
		return getThreatQuery(currentPage, type)
	except:
		return error()

#get a full threat query
@app.route('/threats/type/<string:type>', methods=['POST'])
def returnFullThreatQuery(type):
	try:
		return getFullThreatQuery(type)
	except:
		return error()

#get a threat query
@app.route('/threats/advanced', methods=['POST'])
def returnAdvancedThreatQuery():
	try:
		return getAdvancedThreatQuery()
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

#add a new asset
@app.route('/assets', methods=['POST'])
@jwt_required()
def addAsset():
	try:
		return sendPostRequest("assets")
	except:
		return error()

#add a new attack type
@app.route('/attack_types', methods=['POST'])
@jwt_required()
def addAttackType():
	try:
		return sendPostRequest("attack_types")
	except:
		return error()

#add a new attack vector
@app.route('/attack_vectors', methods=['POST'])
@jwt_required()
def addAttackVector():
	try:
		return sendPostRequest("attack_vectors")
	except:
		return error()

#add a new vulnerability
@app.route('/vulnerabilities', methods=['POST'])
@jwt_required()
def addVulnerability():
	try:
		return sendPostRequest("vulnerabilities")
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

@app.route('/functions/getTokenizedText/<int:isThreat>', methods=['POST'])
def getTokenizedText(isThreat):
	try:
		return calculateTokenizedText(isThreat=(isThreat == 1))
	except:
		return error()

@app.route('/users_products/insertTrainingData', methods=['POST'])
@jwt_required()
def saveTrainingdata():
	try:
		return postTrainingdata()
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
		return deleteProduct(id)
	except:
		return error()

#delete a feed
@app.route('/feeds/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAFeed(id):
	try:
		return deleteFeed(id)
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

#delete an asset
@app.route('/assets/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAnAsset(id):
	try:
		return sendDeleteRequest("assets", {"asset_id":id})
	except:
		return error()

#delete an attack type
@app.route('/attack_types/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAnAttackType(id):
	try:
		return sendDeleteRequest("attack_types", {"atktyp_id":id})
	except:
		return error()

#delete an attack vector
@app.route('/attack_vectors/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAnAttackVector(id):
	try:
		return sendDeleteRequest("attack_vectors", {"atkvtr_id":id})
	except:
		return error()

#delete a vulnerability
@app.route('/vulnerabilities/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAVulnerability(id):
	try:
		return sendDeleteRequest("vulnerabilities", {"vuln_id":id})
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

#delete a threat
@app.route('/threats/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteAThreat(id):
	try:
		return deleteThreat(id)
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
		return deleteProductThreat(pid, tid)
	except:
		return error()

#delete a feed type
@app.route('/feedTypes/<int:id>', methods=['DELETE'])
@jwt_required()
def deleteOneFeedType(id):
	try:
		return deleteFeedType(id)
	except:
		return error()
#delete a saved product (remove from watchlist)
@app.route('/<int:id>/savedProducts/<int:pid>', methods=['DELETE'])
@jwt_required()
def deleteOneSavedProduct(id, pid):
	try:
		return removeProductFromWatchlist(id, pid)
	except:
		return error()

#delete a saved product (remove from watchlist)
@app.route('/<int:id>/savedThreats/<int:tid>', methods=['DELETE'])
@jwt_required()
def deleteOneSavedThreat(id, tid):
	try:
		return removeThreatFromWatchlist(id, tid)
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

#update a product's description
@app.route('/products/<int:id>/category', methods=['PUT'])

#update a product
@app.route('/products/<int:id>', methods=['PUT'])
@jwt_required()
def updateAProduct(id):
	try:
		return sendPutRequest("products", "product_id", id)
	except:
		return error()

#update a feed
@app.route('/feeds/<int:id>', methods=['PUT'])
@jwt_required()
def updateAFeed(id):
	try:
		return sendPutRequest("feeds", "feed_id", id)
	except:
		return error()

#update a feed type
@app.route('/feedTypes/<int:id>', methods=['PUT'])
@jwt_required()
def updateAFeedType(id):
	try:
		return sendPutRequest("feedTypes", "type_id", id)
	except:
		return error()

#update an adversary
@app.route('/adversaries/<int:id>', methods=['PUT'])
@jwt_required()
def updateAnAdversary(id):
	try:
		return sendPutRequest("adversaries", "adv_id", id)
	except:
		return error()

#update an asset
@app.route('/assets/<int:id>', methods=['PUT'])
@jwt_required()
def updateAnAsset(id):
	try:
		return sendPutRequest("assets", "asset_id", id)
	except:
		return error()

#update an attack_type
@app.route('/attack_types/<int:id>', methods=['PUT'])
@jwt_required()
def updateAnAttackType(id):
	try:
		return sendPutRequest("attack_types", "atktyp_id", id)
	except:
		return error()

#update an attack_vector
@app.route('/attack_vectors/<int:id>', methods=['PUT'])
@jwt_required()
def updateAnAttackVector(id):
	try:
		return sendPutRequest("attack_vectors", "atkvtr_id", id)
	except:
		return error()

#update a vulnerability
@app.route('/vulnerabilities/<int:id>', methods=['PUT'])
@jwt_required()
def updateAVulnerability(id):
	try:
		return sendPutRequest("vulnerabilities", "vuln_id", id)
	except:
		return error()

#update a product category
@app.route('/productCategories/<int:id>', methods=['PUT'])
@jwt_required()
def updateAProductCategory(id):
	try:
		return sendPutRequest("productCategories", "category_id", id)
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

#update multiple threats' ratings
@app.route('/threats/ratings', methods=['PUT'])
@jwt_required()
def updateThreatRatings():
	try:
		return putThreatRatings()
	except:
		return error()

#update multiple threats' statuses
@app.route('/threats/statuses', methods=['PUT'])
@jwt_required()
def updateThreatStatuses():
	try:
		return putThreatStatuses()
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

#update a threat's adversary
@app.route('/threats/<int:id>/adversary', methods=['PUT'])
@jwt_required()
def updateThreat(id):
	try:
		return sendPutRequest("threats", "threat_id", id)
	except:
		return error()

@app.route('/threats/<int:id>/retrain', methods=['PUT'])
@jwt_required()
def retrainAThreat(id):
	try:
		return retrainThreat(id)
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
	if (config["isDeveloping"]):
		app.run(host='127.0.0.1', port=port) #debug=True)
	else:
		app.run(host='0.0.0.0', port=port) #debug=True)
