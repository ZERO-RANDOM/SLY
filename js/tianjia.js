$(document).ready(function() {

	var i = 1;
	var btn1 = document.getElementsByClassName("tianjia");
	var btn2 = document.getElementsByClassName("delete");

	for(var a = 0; a < btn1.length; a++) {
		btn1[a].addEventListener("tap", function() {
			$("#tianjia").text(i);
			mui.toast('已添加至菜单');
			i++;
		});

	}
	for(var a = 0; a < btn2.length; a++) {
		btn2[a].addEventListener("tap", function() {
			i--;
			$("#tianjia").text(i-1);
			mui.toast('已从菜单删除');
		});

	}
});