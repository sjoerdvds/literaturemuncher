$(document).ready(function(){test()})

function test(){
	console.log("Testing SOAP call")
	$.soap({
		url:'http://search.webofknowledge.com/esti/wokmws/ws/WOKMWSAuthenticate?wsdl',
		method:'authenticate',
		action: '',
		success: function (soapResponse){
			console.log("succes")
		},
		error: function (soapResponse){
			console.log("error")
		}
	})
	console.log("Survived!")

}
