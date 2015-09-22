module.exports = {
    dependency: 'ios',
    condition: function (answer) {
        return answer.deploy && answer.cupertino;
    },
    type: 'input',
    name: 'label',
    message: 'What is the name of the signing label?'
};
