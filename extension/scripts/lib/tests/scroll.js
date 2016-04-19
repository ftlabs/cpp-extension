/**
 * This runs on the client-side
 *
 * Counts the number of scroll events that are bound in the first second
 * and then returns true if events have been bound or false if not.
 *
 */
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
		}.bind(this), 1000);
		
	});
		
}