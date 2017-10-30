$(document).ready(function() {
	$("#xiangqing").hide();
	$("#xiangqing1").hide();
	$("#xiangqing2").hide();
	$("#hidden-img").hide();
	var btn2 = document.getElementById("dengjikou2");
	var btn3 = document.getElementById("dengjikou3");
	var btn7 = document.getElementById("dengjikou7");
	var btns = document.getElementById("guanbi");
	var btns1 = document.getElementById("guanbi1");
	var btns2 = document.getElementById("guanbi2");


	btn2.addEventListener("tap", function() {
		$("#xiangqing").show();
	});
	btn3.addEventListener("tap", function() {
		$("#xiangqing1").show();
	});
	btn7.addEventListener("tap", function() {
		$("#xiangqing2").show();
	});
	
	btns.addEventListener("tap", function() {
		$("#xiangqing").hide();
	});
	btns1.addEventListener("tap", function() {
		$("#xiangqing1").hide();
	});
	btns2.addEventListener("tap", function() {
		$("#xiangqing2").hide();
	});
});