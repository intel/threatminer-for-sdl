import pymysql.cursors
import pymysql
import json
import os
from subprocess import check_output, call

__location__ = os.path.realpath(os.path.join(os.getcwd(), os.path.dirname(__file__)))

# Load config.json into "config"
with open(os.path.join(__location__, 'config.json')) as f:
	config = json.load(f)["databaseConnection"]

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
	ssl = { 'ca': os.path.join(__location__, sslFile)}
cursorclass=pymysql.cursors.DictCursor

# NOTE: THIS METHOD IS UNSAFE FOR USER INPUT. USER FOR ONLY INTERNAL QUERIES
# Get database records
# Parameters:
#  query - A query that specifically retrieves data i.e. "select *"
# Returns:
#  A flask response object: http://flask.pocoo.org/docs/0.12/api/#flask.Response
def sendUnsafeGetRequest(query):
	try:
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
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
def executeQuery(query):
	try:
		conn = pymysql.connect(host, user, password, db, port, charset=charset, cursorclass=cursorclass, ssl=ssl)
		cursor = conn.cursor()
		cursor.execute(query)
		conn.commit()
		return "Request was a success!"
	finally:
		cursor.close()
		conn.close()

print("Creating users table...")
executeQuery("CREATE TABLE `users` ( `user_id` int(11) NOT NULL AUTO_INCREMENT, `user_username` varchar(20) DEFAULT NULL, `user_password` varchar(256) DEFAULT NULL, `user_firstName` varchar(45) DEFAULT NULL, `user_role` varchar(45) DEFAULT NULL, `user_lastName` varchar(45) DEFAULT NULL, `user_email` text, PRIMARY KEY (`user_id`), UNIQUE KEY `ix_users_user_username` (`user_username`))")

print("Creating productCategories table...")
executeQuery("CREATE TABLE `productCategories` ( `category_id` int(11) NOT NULL AUTO_INCREMENT, `category_name` varchar(100) DEFAULT NULL, `category_desc` text, PRIMARY KEY (`category_id`), UNIQUE KEY `category_name_UNIQUE` (`category_name`))")

print("Creating products table...")
executeQuery("CREATE TABLE `products` ( `product_id` int(11) NOT NULL AUTO_INCREMENT, `product_name` varchar(150) DEFAULT NULL, `product_desc` text, `category_id` int(11) DEFAULT NULL, `product_editor` varchar(200) DEFAULT NULL, `product_updated` varchar(30) DEFAULT NULL, `product_emailTime` varchar(30) DEFAULT NULL, PRIMARY KEY (`product_id`), KEY `cat_idx` (`category_id`), CONSTRAINT `cat` FOREIGN KEY (`category_id`) REFERENCES `productCategories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE)")

print("Creating keywords table...")
executeQuery("CREATE TABLE `keywords` ( `keyword_id` bigint(20) NOT NULL AUTO_INCREMENT, `keyword` varchar(200) DEFAULT NULL, `product_id` int(11) DEFAULT NULL, PRIMARY KEY (`keyword_id`), KEY `product_id_idx` (`product_id`), CONSTRAINT `product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE)")

print("Creating feedTypes table...")
executeQuery("CREATE TABLE `feedTypes` ( `type_id` int(11) NOT NULL AUTO_INCREMENT, `type_name` varchar(150) DEFAULT NULL, `type_desc` text, PRIMARY KEY (`type_id`), UNIQUE KEY `type_name_UNIQUE` (`type_name`))")

print("Creating feeds table...")
executeQuery("CREATE TABLE `feeds` ( `feed_id` int(11) NOT NULL AUTO_INCREMENT, `feed_title` varchar(150) DEFAULT NULL, `feed_link` text, `feed_desc` text, `feed_type` int(11) DEFAULT NULL, PRIMARY KEY (`feed_id`), KEY `type_id_idx` (`feed_type`), CONSTRAINT `feedtype` FOREIGN KEY (`feed_type`) REFERENCES `feedTypes` (`type_id`) ON DELETE SET NULL ON UPDATE CASCADE)")

print("Creating threats table...")
executeQuery("CREATE TABLE `threats` ( `threat_id` bigint(20) NOT NULL AUTO_INCREMENT, `threat_title` text, `threat_link` text, `threat_desc` text, `threat_status` varchar(45) DEFAULT NULL, `threat_date` varchar(30) DEFAULT NULL, `feed_id` int(11) DEFAULT NULL, `threat_rating` varchar(45) DEFAULT NULL, `threat_owner` varchar(9) DEFAULT NULL, `threat_note` text, `threat_editor` varchar(200) DEFAULT NULL, `product_id` int(11) DEFAULT NULL, `threat_classification` text, PRIMARY KEY (`threat_id`), KEY `fe_idx` (`feed_id`), KEY `usr_idx` (`threat_owner`), KEY `product_key_idx` (`product_id`), CONSTRAINT `feed` FOREIGN KEY (`feed_id`) REFERENCES `feeds` (`feed_id`) ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT `product_key` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE SET NULL ON UPDATE CASCADE, CONSTRAINT `usr` FOREIGN KEY (`threat_owner`) REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE)")

print("Creating users_products table...")
executeQuery("CREATE TABLE `users_products` ( `user_id` varchar(9) NOT NULL, `product_id` int(11) NOT NULL, PRIMARY KEY (`user_id`,`product_id`), KEY `usrprod_idx` (`product_id`), CONSTRAINT `produr` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT `usrprod` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE)")

print("Creating users_threats table...")
executeQuery("CREATE TABLE `users_threats` ( `user_id` varchar(9) NOT NULL, `threat_id` bigint(20) NOT NULL, PRIMARY KEY (`threat_id`,`user_id`), KEY `us_idx` (`user_id`), CONSTRAINT `tr` FOREIGN KEY (`threat_id`) REFERENCES `threats` (`threat_id`) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT `us` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE)")

print("Creating training data table...")
executeQuery("CREATE TABLE `training_data` ( `train_id` bigint(20) NOT NULL AUTO_INCREMENT, `train_desc` text, `train_classification` text, `train_updated` timestamp NULL DEFAULT NULL, PRIMARY KEY (`train_id`))")

print("Creating adversaries and xref tables...")
executeQuery("CREATE TABLE `adversaries` (`adv_id` int(11) NOT NULL AUTO_INCREMENT, `adv_name` varchar(150) NOT NULL, `adv_desc` text, PRIMARY KEY (`adv_id`), UNIQUE KEY `adv_name` (`adv_name`))")
executeQuery("CREATE TABLE `adversaries_threats_xref` (`fk_adv_id` int(11) NOT NULL, `fk_threat_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_adv_id`,`fk_threat_id`), KEY `ix_adversaries_threats_xref_fk_adv_id` (`fk_adv_id`), KEY `ix_adversaries_threats_xref_fk_threat_id` (`fk_threat_id`), CONSTRAINT `adversaries_threats_xref_ibfk_1` FOREIGN KEY (`fk_adv_id`) REFERENCES `adversaries` (`adv_id`) ON DELETE CASCADE, CONSTRAINT `adversaries_threats_xref_ibfk_2` FOREIGN KEY (`fk_threat_id`) REFERENCES `threats` (`threat_id`) ON DELETE CASCADE)")
executeQuery("CREATE TABLE `adversaries_training_data_xref` ( `fk_adv_id` int(11) NOT NULL, `fk_train_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_adv_id`,`fk_train_id`), KEY `ix_adversaries_training_data_xref_fk_adv_id` (`fk_adv_id`), KEY `ix_adversaries_training_data_xref_fk_train_id` (`fk_train_id`), CONSTRAINT `adversaries_training_data_xref_ibfk_1` FOREIGN KEY (`fk_adv_id`) REFERENCES `adversaries` (`adv_id`) ON DELETE CASCADE, CONSTRAINT `adversaries_training_data_xref_ibfk_2` FOREIGN KEY (`fk_train_id`) REFERENCES `training_data` (`train_id`) ON DELETE CASCADE)")

print("Creating assets and xref tables...")
executeQuery("CREATE TABLE `assets` ( `asset_id` int(11) NOT NULL AUTO_INCREMENT, `asset_name` varchar(150) NOT NULL, `asset_desc` text, PRIMARY KEY (`asset_id`), UNIQUE KEY `asset_name` (`asset_name`))")
executeQuery("CREATE TABLE `assets_threats_xref` ( `fk_asset_id` int(11) NOT NULL, `fk_threat_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_asset_id`,`fk_threat_id`), KEY `ix_assets_threats_xref_fk_asset_id` (`fk_asset_id`), KEY `ix_assets_threats_xref_fk_threat_id` (`fk_threat_id`), CONSTRAINT `assets_threats_xref_ibfk_1` FOREIGN KEY (`fk_asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE, CONSTRAINT `assets_threats_xref_ibfk_2` FOREIGN KEY (`fk_threat_id`) REFERENCES `threats` (`threat_id`) ON DELETE CASCADE)")
executeQuery("CREATE TABLE `assets_training_data_xref` ( `fk_asset_id` int(11) NOT NULL, `fk_train_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_asset_id`,`fk_train_id`), KEY `ix_assets_training_data_xref_fk_asset_id` (`fk_asset_id`), KEY `ix_assets_training_data_xref_fk_train_id` (`fk_train_id`), CONSTRAINT `assets_training_data_xref_ibfk_1` FOREIGN KEY (`fk_asset_id`) REFERENCES `assets` (`asset_id`) ON DELETE CASCADE, CONSTRAINT `assets_training_data_xref_ibfk_2` FOREIGN KEY (`fk_train_id`) REFERENCES `training_data` (`train_id`) ON DELETE CASCADE)")

print("Creating attack types and xref tables...")
executeQuery("CREATE TABLE `attack_types` ( `atktyp_id` int(11) NOT NULL AUTO_INCREMENT, `atktyp_name` varchar(150) NOT NULL, `atktyp_desc` text, PRIMARY KEY (`atktyp_id`), UNIQUE KEY `atktyp_name` (`atktyp_name`))")
executeQuery("CREATE TABLE `attack_types_threats_xref` ( `fk_atktyp_id` int(11) NOT NULL, `fk_threat_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_atktyp_id`,`fk_threat_id`), KEY `ix_attack_types_threats_xref_fk_atktyp_id` (`fk_atktyp_id`), KEY `ix_attack_types_threats_xref_fk_threat_id` (`fk_threat_id`), CONSTRAINT `attack_types_threats_xref_ibfk_1` FOREIGN KEY (`fk_atktyp_id`) REFERENCES `attack_types` (`atktyp_id`) ON DELETE CASCADE, CONSTRAINT `attack_types_threats_xref_ibfk_2` FOREIGN KEY (`fk_threat_id`) REFERENCES `threats` (`threat_id`) ON DELETE CASCADE)")
executeQuery("CREATE TABLE `attack_types_training_data_xref` ( `fk_atktyp_id` int(11) NOT NULL, `fk_train_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_atktyp_id`,`fk_train_id`), KEY `ix_attack_types_training_data_xref_fk_atktyp_id` (`fk_atktyp_id`), KEY `ix_attack_types_training_data_xref_fk_train_id` (`fk_train_id`), CONSTRAINT `attack_types_training_data_xref_ibfk_1` FOREIGN KEY (`fk_atktyp_id`) REFERENCES `attack_types` (`atktyp_id`) ON DELETE CASCADE, CONSTRAINT `attack_types_training_data_xref_ibfk_2` FOREIGN KEY (`fk_train_id`) REFERENCES `training_data` (`train_id`) ON DELETE CASCADE)")

print("Creating attack vectors and xref tables...")
executeQuery("CREATE TABLE `attack_vectors` ( `atkvtr_id` int(11) NOT NULL AUTO_INCREMENT, `atkvtr_name` varchar(150) NOT NULL, `atkvtr_desc` text, PRIMARY KEY (`atkvtr_id`), UNIQUE KEY `atkvtr_name` (`atkvtr_name`))")
executeQuery("CREATE TABLE `attack_vectors_threats_xref` ( `fk_atkvtr_id` int(11) NOT NULL, `fk_threat_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_atkvtr_id`,`fk_threat_id`), KEY `ix_attack_vectors_threats_xref_fk_atkvtr_id` (`fk_atkvtr_id`), KEY `ix_attack_vectors_threats_xref_fk_threat_id` (`fk_threat_id`), CONSTRAINT `attack_vectors_threats_xref_ibfk_1` FOREIGN KEY (`fk_atkvtr_id`) REFERENCES `attack_vectors` (`atkvtr_id`) ON DELETE CASCADE, CONSTRAINT `attack_vectors_threats_xref_ibfk_2` FOREIGN KEY (`fk_threat_id`) REFERENCES `threats` (`threat_id`) ON DELETE CASCADE)")
executeQuery("CREATE TABLE `attack_vectors_training_data_xref` ( `fk_atkvtr_id` int(11) NOT NULL, `fk_train_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_atkvtr_id`,`fk_train_id`), KEY `ix_attack_vectors_training_data_xref_fk_atkvtr_id` (`fk_atkvtr_id`), KEY `ix_attack_vectors_training_data_xref_fk_train_id` (`fk_train_id`), CONSTRAINT `attack_vectors_training_data_xref_ibfk_1` FOREIGN KEY (`fk_atkvtr_id`) REFERENCES `attack_vectors` (`atkvtr_id`) ON DELETE CASCADE, CONSTRAINT `attack_vectors_training_data_xref_ibfk_2` FOREIGN KEY (`fk_train_id`) REFERENCES `training_data` (`train_id`) ON DELETE CASCADE)")

print("Creating vulnerabilities and xref tables...")
executeQuery("CREATE TABLE `vulnerabilities` ( `vuln_id` int(11) NOT NULL AUTO_INCREMENT, `vuln_name` varchar(150) NOT NULL, `vuln_desc` text, PRIMARY KEY (`vuln_id`), UNIQUE KEY `vuln_name` (`vuln_name`))")
executeQuery("CREATE TABLE `vulnerabilities_threats_xref` ( `fk_vuln_id` int(11) NOT NULL, `fk_threat_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_vuln_id`,`fk_threat_id`), KEY `ix_vulnerabilities_threats_xref_fk_threat_id` (`fk_threat_id`), KEY `ix_vulnerabilities_threats_xref_fk_vuln_id` (`fk_vuln_id`), CONSTRAINT `vulnerabilities_threats_xref_ibfk_1` FOREIGN KEY (`fk_threat_id`) REFERENCES `threats` (`threat_id`) ON DELETE CASCADE, CONSTRAINT `vulnerabilities_threats_xref_ibfk_2` FOREIGN KEY (`fk_vuln_id`) REFERENCES `vulnerabilities` (`vuln_id`) ON DELETE CASCADE)")
executeQuery("CREATE TABLE `vulnerabilities_training_data_xref` ( `fk_vuln_id` int(11) NOT NULL, `fk_train_id` bigint(20) NOT NULL, PRIMARY KEY (`fk_vuln_id`,`fk_train_id`), KEY `ix_vulnerabilities_training_data_xref_fk_train_id` (`fk_train_id`), KEY `ix_vulnerabilities_training_data_xref_fk_vuln_id` (`fk_vuln_id`), CONSTRAINT `vulnerabilities_training_data_xref_ibfk_1` FOREIGN KEY (`fk_train_id`) REFERENCES `training_data` (`train_id`) ON DELETE CASCADE, CONSTRAINT `vulnerabilities_training_data_xref_ibfk_2` FOREIGN KEY (`fk_vuln_id`) REFERENCES `vulnerabilities` (`vuln_id`) ON DELETE CASCADE)")

print("Populating Product Categories")
executeQuery("INSERT INTO productCategories (category_name) VALUES ('Firmware'), ('Mobile App'), ('Cloud'), ('Driver'), ('Kernel Component'), ('Library'), ('Developer Tool'), ('Middleware'), ('Application'), ('Hosted Service'), ('HPC'), ('Intel Architecture'), ('Metasploit Modules'), ('Protocol'), ('Hardware'), ('Crypto'), ('Operating System'), ('Networking');")

print("Populating Feed Types")
executeQuery("INSERT INTO feedTypes (type_name) VALUES ('Blog Feed'), ('RSS Feed'), ('XML Feed'), ('Feedburner'), ('STIX'), ('Atom'), ('HTML Feed'), ('Feedblitz'), ('Twitter');")


print("done")
