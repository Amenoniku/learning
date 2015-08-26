mongoose = require('./libs/mongoose')
User = require('./modelsDB/user').User
async = require 'async'

open =(callback) ->
	mongoose.connection.on "open", callback

dropDatabase =(callback) ->
	db = mongoose.connection.db
	db.dropDatabase callback

requireModels =(callback) ->
	require './modelsDB/user'
	async.each Object.keys(mongoose.models), (modelName, callback) ->
		mongoose.models[modelName].ensureIndexes callback
	, callback

createUsers =(callback) ->
	users = [
		{username: "Вася1", password: "supernov41a"}
		{username: "Вася2", password: "supern4ova"}
		{username: "Вася3", password: "superno6va"}]
	async.each users, (userData, callback) ->
		user = new User userData
		user.save callback
	, callback

async.series [
	open
	# dropDatabase
	requireModels
	# createUsers
], (err, result) ->
	console.log arguments
	mongoose.disconnect

# MongoClient = require('mongodb').MongoClient
# assert = require('assert')

# # // Connection URL
# url = 'mongodb://localhost:27017/chat'

# # // Use connect method to connect to the Server
# MongoClient.connect url, (err, db) ->
# 	assert.equal null, err
# 	console.log "Connected correctly to server"
# 	# insertDocuments db, ->
# 	updateDocument db, ->
# 	# removeDocument db, ->
# 	# findDocuments db, ->
# 		do db.close

# insertDocuments = (db, callback) ->
# 	# Get the documents collection
# 	collection = db.collection 'documents'
# 	# Insert some documents
# 	collection.insert [
# 		{ a: 0 }
# 		{ a: 1 }
# 		{ a: 2 }
# 	], (err, result) ->
# 		assert.equal err, null
# 		assert.equal 3, result.result.n
# 		assert.equal 3, result.ops.length
# 		console.log 'Inserted 3 documents into the document collection'
# 		callback result
# 		return
# 	return

# updateDocument = (db, callback) ->
#   # Get the documents collection
#   collection = db.collection('documents')
#   # Update document where a is 2, set b equal to 1
#   collection.update { a: 1 }, { $set: b: 1 }, (err, result) ->
#     assert.equal err, null
#     assert.equal 0, result.result.n
#     console.log 'Updated the document with the field a equal to 2'
#     callback result
#     return
#   return

# removeDocument = (db, callback) ->
#   # Get the documents collection
#   collection = db.collection('documents')
#   # Insert some documents
#   collection.remove { a: 2 }, (err, result) ->
#     assert.equal err, null
#     assert.equal 0, result.result.n
#     console.log 'Removed the document with the field a equal to 3'
#     callback result
#     return
#   return

# findDocuments = (db, callback) ->
#   # Get the documents collection
#   collection = db.collection('documents')
#   # Find some documents
#   collection.find({}).toArray (err, docs) ->
#     assert.equal err, null
#     assert.equal 8, docs.length
#     console.log 'Found the following records'
#     console.dir docs
#     callback docs
#     return
#   return
