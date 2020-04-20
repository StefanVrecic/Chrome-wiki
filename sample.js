// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// A generic onclick callback function.


  
function genericOnClick(info, tab) {
	
	let text = JSON.stringify(info.selectionText);
	text = text.substring(0, text.length - 1);
	text = text.substring(1);
	const linkToSearch = "https://en.wikipedia.org/api/rest_v1/page/summary/" + text;
	const disambLink = "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles="
	+ text + "&rvslots=%2A&rvprop=content&formatversion=2&format=json";
	var testVar = "a";


	fetch(linkToSearch,{ method: 'GET' }).then( response => response.json() )
  .then( json => {
	  if (json.type == "disambiguation") {
		//   alert("returning fetch");
			return fetch(disambLink,{ method: 'GET' });
	  } else {
	//   show display
	imageLoad = null;
	if (json.thumbnail) {
		imageLoad = json.thumbnail.source;
   }
   
	let injectImg = "";
	if (imageLoad != null) {
		 injectImg = "<img width='180' src="+imageLoad+">";
	}
	
	
	let injectionShow = json.extract_html;
	
	if (injectionShow == null) {
		injectionShow = "Nothing found!";
	}
	
	
	let injectExit = "<div class='exit-wiki-preview'><button onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);'>Close</button></div>";

	 const inject = "<div class='wiki-injected' style='background-color:white; top:50px; position:fixed; font-size:16px; border:solid black 3px; resize: both; left:25px; width:525px; z-index:1000; overflow:scroll;'>" + injectionShow + injectImg + injectExit + "</div>";
	 
	 

	chrome.storage.local.set({
		injection: inject
	}, function () {
		chrome.tabs.executeScript({
			file: "contentscript.js"
		});
	});
	return;
	  }
  })
  .then( response => response.json() )
  .then( json => {
	  
		let injectionShow = json.query.pages[0].revisions[0].slots.main.content;


		injectionShow = injectionShow.substring(injectionShow.indexOf('\n')+1);
		injectionShow = "highlight one of the bolded texts and click preview again:<br/> " + injectionShow.substring(injectionShow.indexOf('\n')+1);
		injectionShow = injectionShow.replace("Concepts", "");
		injectionShow = injectionShow.split("may refer to:").join("");
		injectionShow = injectionShow.split("{{TOC right}}").join("");
		injectionShow = injectionShow.split("[[").join("<b><br/>");
		injectionShow = injectionShow.split("]],").join("</b><br/>");
		injectionShow = injectionShow.split("*").join("");
		injectionShow = injectionShow.split("==").join("");
		injectionShow = injectionShow.split(";").join("");

		let injectExit = "<div class='exit-wiki-preview'><button onclick='this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);'>Close</button></div>";

		const inject = "<div class='wiki-injected' style='background-color:white; top:50px; position:fixed; font-size:16px; height: 50vh; border:solid black 3px; resize: both; left:25px; width:525px; z-index:1000; overflow:scroll;'>" + injectionShow + injectExit + "</div>";

		// alert(inject);

	  chrome.storage.local.set({
		injection: inject
	}, function () {
		chrome.tabs.executeScript({
			file: "contentscript.js"
		});
	});

  } )
  .catch( error => {} );


// 		  fetch(disambLink,{ method: 'GET' }).then( response => response.json() )
//   .then( json => {
// 	  alert(json.query.pages[0].revisions[0].slots.main.content + "./././././.");
//   })
	

  
}

// Create one test item for each context type.
var contexts = ["selection"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  var title = "Preview '" + context + "' with Wikipedia";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  console.log("'" + context + "' item:" + id);
}

