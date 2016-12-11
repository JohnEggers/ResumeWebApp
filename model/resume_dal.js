var mysql   = require('mysql');
var db  = require('./db_connection.js');

/* DATABASE CONFIGURATION */
var connection = mysql.createConnection(db.config);

exports.getAll = function(callback) {
    var query = 'SELECT * FROM resume_view';

    connection.query(query, function(err, result) {
        callback(err, result);
    });
};

exports.getById = function(resume_id, callback) {
    var query = 'SELECT * FROM resume_view WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};

exports.insert = function(params, callback) {
    var query = 'INSERT INTO resume (resume_name, account_id) VALUES (?, ?)';
    var queryData = [params.resume_name, params.account_id];
    connection.query(query, queryData, function(err, result) {
        var resume_id = result.insertId;

        var query = 'INSERT INTO resume_skill (resume_id, skill_id) VALUES ?';
        var resumeSkillData = [];
        for(var i=0; i < params.skill_id.length; i++) {
            resumeSkillData.push([resume_id, params.skill_id[i]]);
        }
        connection.query(query, [resumeSkillData], function(err, result){
            callback(err, result);
        });

        var query = 'INSERT INTO resume_school (resume_id, school_id) VALUES ?';
        var resumeSchoolData = [];
        for(var i=0; i < params.school_id.length; i++) {
            resumeSchoolData.push([resume_id, params.school_id[i]]);
        }
        connection.query(query, [resumeSchoolData], function(err, result){
            callback(err, result);
        });

        var query = 'INSERT INTO resume_company (resume_id, company_id) VALUES ?';
        var resumeCompanyData = [];
        for(var i=0; i < params.company_id.length; i++) {
            resumeCompanyData.push([resume_id, params.company_id[i]]);
        }
        connection.query(query, [resumeCompanyData], function(err, result){
            callback(err, result);
        });


    });
};


exports.delete = function(resume_id, callback) {
    var query = 'DELETE FROM resume WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });

};


//declare the function so it can be used locally
var resumeSkillInsert = function(resume_id, skillIdArray, callback){
    // NOTE THAT THERE IS ONLY ONE QUESTION MARK IN VALUES ?
    var query = 'INSERT INTO resume_skill (resume_id, skill_id) VALUES ?';

    // TO BULK INSERT RECORDS WE CREATE A MULTIDIMENSIONAL ARRAY OF THE VALUES
    var resumeSkillData = [];
    for(var i=0; i < skillIdArray.length; i++) {
        resumeSkillData.push([resume_id, skillIdArray[i]]);
    }
    connection.query(query, [resumeSkillData], function(err, result){
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSkillInsert = resumeSkillInsert;


//declare the function so it can be used locally
var resumeSkillDeleteAll = function(resume_id, callback){
    var query = 'DELETE FROM resume_skill WHERE resume_id = ?';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};
//export the same function so it can be used by external callers
module.exports.resumeSkillDeleteAll = resumeSkillDeleteAll;


exports.update = function(params, callback) {
    var query = 'UPDATE resume SET resume_name = ? WHERE resume_id = ?';

    var queryData = [params.resume_name, params.resume_id];

    connection.query(query, queryData, function(err, result) {
        //delete resume_skill entries for this resume
        resumeSkillDeleteAll(params.resume_id, function(err, result){

            if(params.skill_id != null) {
                //insert resume_skill ids
                resumeSkillInsert(params.resume_id, params.skill_id, function(err, result){
                    callback(err, result);
                });}
            else {
                callback(err, result);
            }
        });

    });
};

exports.edit = function(resume_id, callback) {
    var query = 'CALL resume_getinfo(?)';
    var queryData = [resume_id];

    connection.query(query, queryData, function(err, result) {
        callback(err, result);
    });
};