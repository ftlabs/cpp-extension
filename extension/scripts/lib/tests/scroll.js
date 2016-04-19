// This test runs on the client side.

module.exports = function (){
	
	let thingsThatListenToScrollEvent = 0;
	const origEventListener = window.addEventListener;

	window.addEventListener = function(e, f, b){

		if(e === 'scroll'){
			console.log("Scroll event has been bound");
			thingsThatListenToScrollEvent += 1;
		}
		
		origEventListener(e, f, b);

	}
	
	return new Promise((resolve) => {

		setTimeout(function (){
			if(thingsThatListenToScrollEvent > 0){
				resolve(false);
			} else {
				resolve(true);
			}
			//resolve(thingsThatListenToScrollEvent);
		}.bind(this), 1000);
		
	});
		
}