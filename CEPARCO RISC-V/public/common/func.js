document.addEventListener('DOMContentLoaded', () => {
	document.getElementById("editor").style.display = "flex";
	document.getElementById("opcodes").style.display = "none";
	document.getElementById("errors").style.display = "none";
	document.getElementById("pipelines").style.display = "none";
	document.getElementById("risc-v registers").style.display = "none";
	document.getElementById("registers").style.display = "flex";
	document.getElementById("memory").style.display = "none";
	
	document.getElementById("editor button").onclick = function(){
		document.getElementById("editor").style.display = "flex";
		document.getElementById("opcodes").style.display = "none";
		document.getElementById("errors").style.display = "none";
		document.getElementById("pipelines").style.display = "none";
		document.getElementById("risc-v registers").style.display = "none";
	};
	
	document.getElementById("opcodes button").onclick = function(){
		document.getElementById("editor").style.display = "none";
		document.getElementById("opcodes").style.display = "inline";
		document.getElementById("errors").style.display = "none";
		document.getElementById("pipelines").style.display = "none";
		document.getElementById("risc-v registers").style.display = "none";
	};
	
	document.getElementById("errors button").onclick = function(){
		document.getElementById("editor").style.display = "none";
		document.getElementById("opcodes").style.display = "none";
		document.getElementById("errors").style.display = "flex";
		document.getElementById("pipelines").style.display = "none";
		document.getElementById("risc-v registers").style.display = "none";
	};
	
	document.getElementById("pipelines button").onclick = function(){
		document.getElementById("editor").style.display = "none";
		document.getElementById("opcodes").style.display = "none";
		document.getElementById("errors").style.display = "none";
		document.getElementById("pipelines").style.display = "inline";
		document.getElementById("risc-v registers").style.display = "none";
	};
	
	document.getElementById("risc-v registers button").onclick = function(){
		document.getElementById("editor").style.display = "none";
		document.getElementById("opcodes").style.display = "none";
		document.getElementById("errors").style.display = "none";
		document.getElementById("pipelines").style.display = "none";
		document.getElementById("risc-v registers").style.display = "inline";
	};
	
	document.getElementById("registers button").onclick = function(){
		document.getElementById("registers").style.display = "flex";
		document.getElementById("memory").style.display = "none";
	};
	
	document.getElementById("memory button").onclick = function(){
		document.getElementById("registers").style.display = "none";
		document.getElementById("memory").style.display = "flex";
	};
});
