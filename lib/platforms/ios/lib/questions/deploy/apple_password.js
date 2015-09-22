module.exports = {
    dependency: 'ios',
    condition: function (answer) {
        return answer.deploy && answer.cupertino;
    },
    type: 'password',
    name: 'password',
    message: 'What is your apple developer password?'
};
