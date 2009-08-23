<?php
/*
 * @name 	Dummy Widget
 * @author 	Yorick Peterse
 * @link	http://www.yorickpeterse.com/
 * @package PyroCMS
 * @license MIT License
 * 
 * Widget to display a list of links that can be used to share the current page with others (Twitter, Digg, etc)
 */
class Social_bookmarks extends Widgets {
	
	// Run function
	function run()
	{
		// First fetch the current URL and title
		$data['current_url'] = current_url();
		$data['current_title'] = '';
		
		// Then set some extra variables
		$data['title'] = $this->get_data('social_bookmarks','title');
		$data['links'] = $this->get_data('social_bookmarks','links');
		
		// Then load the view file
		$this->display('social_bookmarks','bookmarks',$data);
	}
	
	
	// Install function (executed when the user installs the widget)
	function install() 
	{
		$name = 'social_bookmarking';
		$body = '';
		$this->install_widget($name,$body);
	}
}
?>