<script type="text/javascript">
	(function($) {
		$(function() {

			$('a.parent_page').live('click', function() {
				alert(this.rel);

				return false;
			});

		});
	}
	)(jQuery);
			
</script>

<?php echo form_open('admin/pages/delete'); ?>
<table border="0" class="listTable">    
  <thead>
	<tr>
		<th class="first"><div></div></th>
		<th><a href="#"><?php echo lang('page_page_label');?></a></th>
		<th><a href="#"><?php echo lang('page_slug_label');?></a></th>
		<!-- <th><a href="#"><?//=lang('page_language_label');?></a></th> -->
		<th class="width-10"><a href="#"><?php echo lang('page_updated_label');?></a></th>
		<th class="last width-15"><span><?php echo lang('page_actions_label');?></span></th>
	</tr>
  </thead>
  <tfoot>
  	<tr>
  		<td colspan="6">
  			<div class="inner"><? $this->load->view('admin/fragments/pagination'); ?></div>
  		</td>
  	</tr>
  </tfoot>
  <tbody>
	<?php if (!empty($pages)): ?>
		<?php foreach ($pages as $page): ?>
		<tr>
			<td><input type="checkbox" name="action_to[]" value="<?php echo $page->id;?>" <?php echo ($page->slug == 'home' && $page->parent_id == 0 ) ? 'disabled="disabled"' : '' ?> /></td>
	        <?php if($page->num_children > 0): ?>
	        <td><?php echo anchor('#', $page->title, array('class' => 'parent_page', 'rel' => $page->id));?></td>
	        <?php else: ?>
	        <td><?php echo $page->title;?></td>
	        <?php endif; ?>
	        
	        <td><?php echo $page->slug;?></td>
	        <td><?php echo date('M d, Y', $page->updated_on); ?></td>
	        <td>
				<?php //echo anchor('/' . $page->slug, lang('page_view_label'), 'target="_blank"') . ' | '; ?>
				<?php echo anchor('admin/pages/edit/' . $page->id, lang('page_edit_label')) . ' | '; ?>
				<?php echo anchor('admin/pages/delete/' . $page->id, lang('page_delete_label'), array('class'=>'confirm')); ?>
	        </td>
		</tr>
		<tr class="hidden">
			<td><div class="children"></div></td>
		</tr>
		<? endforeach; ?>		
	<?php else: ?>
		<tr>
			<td colspan="5"><?php echo lang('page_no_pages');?></td>
		</tr>
	<?php endif; ?>
	</tbody>
</table>

<?php $this->load->view('admin/fragments/table_buttons', array('buttons' => array('delete') )); ?>
<?php echo form_close(); ?>