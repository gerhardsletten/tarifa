module.exports = {
    dependency: 'ios',
    condition: function (answer) {
        return answer.deploy;
    },
    type:'input',
    name:'label',
    message:'What is the name of the signing label?'
};
