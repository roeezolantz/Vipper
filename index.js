const toggleVid = (myVid) => myVid.element.paused ? myVid.element.play() : myVid.element.pause();
const adjustRate = (myVid, rate) => myVid.currSpeed = myVid.element.playbackRate = Math.round((myVid.element.playbackRate + rate) * 1e12) / 1e12;
const changeRate = (myVid, rate) => myVid.currSpeed = myVid.element.playbackRate = rate;

const states = {
    increase: {text: "+0.2 <<", selfInvoke: vid => adjustRate(vid, +0.2)},
    status: {isStatus: true},
    decrease: {text: ">> 0.2-", selfInvoke: vid => adjustRate(vid, -0.2)},
    reset: {selfInvoke: vid => changeRate(vid, 1)},
    stop: {smartText: vid => vid.element.paused ? "start" : "stop" , selfInvoke: vid => toggleVid(vid)},
    restart: {selfInvoke: vid => vid.element.currentTime = 0},
}

// Implementation of one-way data binding
function Binding(b) {
	_this = this
    this.value = b.object[b.property]
    this.element = b.element
	this.attribute = b.attribute
	this.valueGetter = function(){
		return _this.value;
	}
	this.valueSetter = function(val){
		_this.value = val
		_this.element[_this.attribute] = val
	}

	Object.defineProperty(b.object, b.property, {
		get: this.valueGetter,
		set: this.valueSetter
	});	
	b.object[b.property] = this.value;
	
	this.element[this.attribute] = this.value
}

let videos = document.getElementsByTagName('video')

// Mapping the videos to add the current speed on each of them (we must seperate it to another object to use the binding on it)
let videosList = Array.from(videos, curr => Object.assign({}, {element:curr, currSpeed: 1}))

// This function wraps a state change handling to a button element with all its functional
function wrapAsButton(stateKey, state, index, myVid) {
    
    let btn = document.createElement("button");
    
    // Set the HTML in the first time
    btn.innerHTML = state.isStatus ? myVid.currSpeed : (state.text ? state.text : stateKey); 

    // Binds the status button to the currSpeed value
    if (state.isStatus) {
        new Binding({
            object: myVid,
            property: "currSpeed",
            element: btn,
            attribute: "innerHTML"
        })
    } else {
        btn.onclick = function() {
            // Prevents the click to affect the video
            event.stopPropagation(); 
            state.selfInvoke(myVid)
            this.innerHTML =  state.smartText ? state.smartText(myVid) : state.text ? state.text : stateKey
        }
    }
    return btn;
}

// This function generates the control buttons for the given video in order to operate only this one
function generateButtonsDiv(myVid, index) {
    let container = document.createElement("div")
    container.id = `custom_controlls_${index}`
    container.style = "z-index: 1; position: relative"
    Object.entries(states).map((curr, index) => container.appendChild(wrapAsButton(curr[0], curr[1], index, myVid)));
    return container;
}

// MAIN PART
videosList.forEach((vid, index) => {
    vid.element.parentElement.appendChild(generateButtonsDiv(vid, index))
})