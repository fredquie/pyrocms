/*
 *
 * tinycimm.js
 * Copyright (c) 2009 Richard Willis
 * MIT license  : http://www.opensource.org/licenses/mit-license.php
 * Project      : http://tinycimm.googlecode.com/
 * Contact      : willis.rh@gmail.com
 *
 */

function TinyCIMM(type){
	this.type = type || null;
	this.recache = false;
	this.settings = tinyMCEPopup.editor.settings;
}

TinyCIMM.prototype.init = function(ed){
	var node = ed.selection.getNode();
	if (tinyMCEPopup.params.resize) {
		this.loadResizer(node.src.toId()+'.'+node.src.extension(), false, node.width);
	} else {
		this.showBrowser(0, 0, true);
	}
};

TinyCIMM.prototype.baseURL = function(url) {
	return tinyMCEPopup.editor.documentBaseURI.toAbsolute(url);
};

TinyCIMM.prototype.cacheImages = function(images){
	for(var img in images){
		new Image().src = images[img];
	}
};

TinyCIMM.prototype.get = function(asset_id, callback){
	tinymce.util.XHR.send({
		url : this.baseURL(this.settings.tinycimm_controller+'get_'+this.type+'/'+asset_id),
		type : "GET",
		error : function(response) {
			tinyMCEPopup.editor.windowManager.alert('There was an error retrieving the asset info.');
			return false;
		},
		success : function(response) {
			var obj = tinymce.util.JSON.parse(response);
			if (!obj.outcome) {
				tinyMCEPopup.editor.windowManager.alert(obj.message);
			} else {
				(callback) && callback(obj);
			}
		}
	});
};

TinyCIMM.prototype.showBrowser = function(folder, offset, load, el) {
	folder = folder || 0;
	offset = offset || 0;
	el = el || false;

	if (TinyCIMMImage.recache) {
		load = true;
		TinyCIMMImage.recache = false;
	} else {
		load = tinyMCEPopup.dom.get('filelist') ? (load || false) : true;
	}

	mcTabs.displayTab('browser_tab','browser_panel');
	tinyMCEPopup.dom.get('resize_tab').style.display = 'none';
	tinyMCEPopup.dom.get('manager_tab').style.display = 'none';

	(load) && (this.fileBrowser) && this.fileBrowser(folder, offset, load, el);
};

TinyCIMM.prototype.showUploader = function() {
	mcTabs.displayTab('upload_tab','upload_panel');
	tinyMCEPopup.dom.get('manager_tab').style.display = 'none';

	(this.loadUploader) && this.loadUploader();
};

// load list of folders and files via json request
TinyCIMM.prototype.getBrowser = function(folder, offset, search_query, callback) {
	var self = this;
	folder = folder || 0;
	offset = offset || 0;
	search_query = search_query || '';

	if (tinyMCEPopup.dom.get('img-'+folder) == null) {
		tinyMCEPopup.dom.setHTML('filebrowser', '<span id="loading">loading</span>');
	}
	(this.type) && tinymce.util.XHR.send({
		url : this.baseURL(this.settings.tinycimm_controller+'get_browser/'+folder+'/'+offset+'/'+search_query),
		type : "GET",
		error : function(reponse) {
			tinyMCEPopup.editor.windowManager.alert('Sorry, there was an error retrieving the assets.');
		},
		success : function(response) {
			// insert the html
			tinyMCEPopup.dom.setHTML('filebrowser', response);
			// bind click event to pagination links
			var pagination_anchors = tinyMCEPopup.dom.select('div.pagination a');
			for(var anchor in pagination_anchors) {
				pagination_anchors[anchor].onclick = function(e){
					e.preventDefault();
					self.fileBrowser(folder, this.href.toId().toString(), true, false);
				};
			}
			(callback) && callback();
		}
	});
};

TinyCIMM.prototype.getManager = function(asset_id, callback) {
	asset_id = asset_id || 0;
	tinymce.util.XHR.send({
		url : this.baseURL(this.settings.tinycimm_controller+'get_manager/'+asset_id),
		type : "GET",
		error : function(reponse) {
			tinyMCEPopup.editor.windowManager.alert('Sorry, there was an error retrieving the assets.');
		},
		success : function(data) {
			(callback) && callback(data);
		}
	});

};

TinyCIMM.prototype.getUploader = function(callback) {
	tinymce.util.XHR.send({
		url : this.baseURL(this.settings.tinycimm_controller+'get_uploader_form'),
		type : "GET",
		error : function(reponse) {
			tinyMCEPopup.editor.windowManager.alert('Sorry, there was an error retrieving the assets.');
		},
		success : function(data) {
			(callback) && callback(data);
		}
	});

};

TinyCIMM.prototype.insert = function(asset_id) {
	var self = this;
	this.get(asset_id, function(asset){
		self.insertAndClose(asset);
	});
};
	
TinyCIMM.prototype.deleteAsset = function(asset_id, callback) {
	var self = this;
	tinyMCEPopup.editor.windowManager.confirm('Are you sure you want to delete this '+this.type+'?', function(s) {
		if (!s) {return false;}
		tinymce.util.XHR.send({
			url : self.baseURL(self.settings.tinycimm_controller+'delete_'+self.type+'/'+asset_id),
			type : "GET",
			error : function(response) {
				tinyMCEPopup.editor.windowManager.alert('There was an error processing the request.');
			},
			success : function(response) {
				var obj = tinymce.util.JSON.parse(response);
				if (!obj.outcome) {
					tinyMCEPopup.editor.windowManager.alert('Error: '+obj.message);
				} else {
					self.showBrowser(obj.folder, 0, true);
					self.showFlashMsg(obj.message);
				}
			}
		});
	});
};

TinyCIMM.prototype.updateAsset = function(asset_id, folder_id, description, filename) {
	var self = this;
	tinymce.util.XHR.send({
		url : self.baseURL(self.settings.tinycimm_controller+'update_asset/'+asset_id),
 		content_type : 'application/x-www-form-urlencoded',
		type : "POST",
		data : 	'folder_id='+folder_id+'&description='+description+'&filename='+filename,
		error : function(response) {
			tinyMCEPopup.editor.windowManager.alert('There was an error processing the request.');
		},
		success : function(response) {
			if (response) {	
				var obj = tinymce.util.JSON.parse(response);
				self.showFlashMsg(obj.message);
			}
		}
	});
};

TinyCIMM.prototype.saveFolder = function(folder_id, folder_name, callback) {
	var self = this;
	tinymce.util.XHR.send({
		url : self.baseURL(self.settings.tinycimm_controller+'save_folder/'+folder_id),
 		content_type : 'application/x-www-form-urlencoded',
		type : "POST",
		data : 	'folder_name='+folder_name,
		error : function(response) {
			tinyMCEPopup.editor.windowManager.alert('There was an error processing the request.');
		},
		success : function(response) {
			var obj = tinymce.util.JSON.parse(response);
			if (!obj.outcome) {
				tinyMCEPopup.editor.windowManager.alert('Error: '+obj.message);
			} else {
				(callback) && (callback(obj));
			}
		}
	});
};

TinyCIMM.prototype.addFolder = function(type) {
	type = type || 'image';
	var self = this, 
	foldername = encodeURIComponent(tinyMCEPopup.dom.get('add-folder-caption').value.replace(/^\s+|\s+$/g, '')),
	requesturl = this.baseURL(this.settings.tinycimm_controller+'save_folder/'+foldername+'/'+type);

	this.saveFolder(0, foldername, function(response){
		if (response.outcome) {
			tinyMCEPopup.dom.get('add-folder').style.display = 'none';
			tinyMCEPopup.dom.get('add-folder-caption').value = '';
			self.showFlashMsg('Folder successfully saved!');
			self.getFoldersHTML(function(folderHTML){
				tinyMCEPopup.dom.setHTML('folderlist', folderHTML)
			});
		}
	});
};

TinyCIMM.prototype.editFolder = function(folder_id){
	var self = this, folder = document.getElementById('folder-'+folder_id);

	folder.editInPlace(function(input_value){
		self.saveFolder(folder_id, input_value, function(){
			self.showFlashMsg('Folder successfully saved!');
			self.getFoldersHTML(function(folderHTML){
				tinyMCEPopup.dom.setHTML('folderlist', folderHTML)
			});
		});
	});
};

TinyCIMM.prototype.deleteFolder = function(folder_id) {
	var self = this;
	tinyMCEPopup.editor.windowManager.confirm('Are you sure you want to delete this folder?', function(s){
		if (!s) { return false; }
		var requesturl = self.baseURL(self.settings.tinycimm_controller+'delete_folder/'+folder_id);
		tinymce.util.XHR.send({
			url : requesturl,
			type : "GET",
			error : function(response) {
	 			tinyMCEPopup.editor.windowManager.alert('There was an error processing the request.');
			},
			success : function(response) {
	 			var obj = tinymce.util.JSON.parse(response);
				if (!obj.outcome) {
					tinyMCEPopup.editor.windowManager.alert('Error: '+obj.message);
	 			} else {
					self.showBrowser(0, 0, true);
					self.showFlashMsg('Folder successfully deleted!');
	 			}
			}
		});
	});
};			

TinyCIMM.prototype.getFoldersSelect = function(folder, type) {
	folder = folder || 0;
	type = type || 'image';
	tinymce.util.XHR.send({
		url : this.baseURL(this.settings.tinycimm_controller+'get_folders/select/'+folder),
		type : "GET",
		error : function(text) {
			tinyMCEPopup.editor.windowManager.alert('There was an error retrieving the select list.');
		},
		success : function(data) {
			tinyMCEPopup.dom.get('folder-select-list').innerHTML = data;
		}
	});
};

TinyCIMM.prototype.getFoldersHTML = function(callback) {
	var self = this;
	tinymce.util.XHR.send({
		url : this.baseURL(this.settings.tinycimm_controller+'get_folders/list'),
		type : "GET",
		error : function(response) {
	 		tinyMCEPopup.editor.windowManager.alert('There was an error processing the request.');
		},
		success : function(response) {
			(callback) && callback(response.toString());	
		}
	});
};
	
TinyCIMM.prototype.changeView = function(view) {
	var self = this;
	// show loading image
	tinyMCEPopup.dom.setHTML('filebrowser', '<span id="loading">loading</span>');
	tinymce.util.XHR.send({
		url : this.baseURL(this.settings.tinycimm_controller+'change_view/'+view),
		type : "GET",
		error : function(text) {
			tinyMCEPopup.editor.windowManager.alert('There was an error processing the request.');
		},
		success : function() {
			self.showBrowser(0, 0, true);	
		}
	});
};

TinyCIMM.prototype.doSearch = function(e, el){
	if (e.keyCode == 13) {
		tinyMCEPopup.dom.get('search-loading').style.display = 'inline-block';
		this.fileBrowser(0, 0, true, false, el.value.safeEscape());
	}
};
	
// reload dialog window to initial state
TinyCIMM.prototype.reload = function() {
	tinyMCEPopup.dom.get('info_tab_link').className = 'rightclick';
	setTimeout(function() {
		window.location.reload();
		tinyMCEPopup.resizeToInnerSize();
	}, 300);
};

TinyCIMM.prototype.removeOverlay = function(){
	var dim = document.getElementById("overlay"), img = document.getElementById("overlayimg");
	(dim) && dim.parentNode.removeChild(dim);
	(img) && img.parentNode.removeChild(img);
};

TinyCIMM.prototype.showOverlay = function() {
	var dim = document.createElement("div"), img = document.createElement("div"), bodyRef = document.getElementById("upload_panel");
	dim.setAttribute("id", "overlay");
	img.setAttribute("id", "overlayimg");
	img.innerHTML = '<div><img src="img/progress.gif" /></div>';
	bodyRef.appendChild(dim);
	bodyRef.appendChild(img);
};

TinyCIMM.prototype.showFlashMsg = function(message){
	setTimeout(function(){
		document.getElementById('flash-msg').hide().html(message).fadeIn(450, function(self){
			setTimeout(function(){
				self.fadeOut(400);
			}, 3000);
		});
	}, 200);
};