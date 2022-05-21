const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
    username: {
        type: String
    },

    email: {
        type: String
    },

    password: {
        type: String
    },

    sections: {
        firstSection: {
            sectionName: {type: String},
            activeTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String},
            }],
            uncomingTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String},
            }],
            completedTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String},
            }],
        },
        secondSection: {
            sectionName: {type: String},
            activeTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String},
            }],
            uncomingTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String},
            }],
            completedTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String}
            }],
        },
        thirdSection: {
            sectionName: {type: String},
            activeTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String},
            }],
            uncomingTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String},
            }],
            completedTask: [{
                taskNumber: {type: String},
                taskDeadline: {type: String},
                taskValue: {type: String},
            }],
        },
    },

    profilePhoto: {
        type: String
    }
})



module.exports = mongoose.model('user', usersSchema);