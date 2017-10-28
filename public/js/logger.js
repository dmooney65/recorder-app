
//module.exports.Logger = () => {

let createMessage = (msg) => {
    var newMessage = document.createElement('li');
    newMessage.setAttribute('class','list-group-item');
    var textNode = document.createTextNode(msg);
    newMessage.appendChild(textNode);
    var list = document.getElementById('log');
    list.insertBefore(newMessage, list.childNodes[0]);
};

//    return {
//        createMessage: createMessage
//    };
//};