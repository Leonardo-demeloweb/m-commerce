
              	40% Parsing the file
orgfree.com
Refresh (accesskey r) Help (accesskey i) Logout (accesskey l)
icon
View file jquery.mmenu.js
Back (accesskey b)   

/*	
 * jQuery mmenu v4.1.3
 * @requires jQuery 1.7.0 or later
 *
 * mmenu.frebsite.nl
 *	
 * Copyright (c) Fred Heusschen
 * www.frebsite.nl
 *
 * Dual licensed under the MIT and GPL licenses.
 * http://en.wikipedia.org/wiki/MIT_License
 * http://en.wikipedia.org/wiki/GNU_General_Public_License
 */
 
 
(function( $ ) {
 
	var _PLUGIN_	= 'mmenu',
		_VERSION_	= '4.1.3';
 
 
	//	Plugin already excists
	if ( $[ _PLUGIN_ ] )
	{
		return;
	}
 
	//	Global variables
	var glbl = {
		$wndw: null,
		$html: null,
		$body: null,
		$page: null,
		$blck: null,
 
		$allMenus: null,
		$scrollTopNode: null
	};
 
	var _c = {}, _e = {}, _d = {},
		_serialnr = 0;
 
 
	$[ _PLUGIN_ ] = function( $menu, opts, conf )
	{
		glbl.$allMenus = glbl.$allMenus.add( $menu );
 
		this.$menu = $menu;
		this.opts  = opts
		this.conf  = conf;
 
		this.serialnr = _serialnr++;
 
		this._init();
 
		return this;
	};
 
	$[ _PLUGIN_ ].prototype = {
 
		open: function()
		{
			this._openSetup();
			this._openFinish();
			return 'open';
		},
		_openSetup: function()
		{
			//	Find scrolltop
			var _scrollTop = findScrollTop();
 
			//	Set opened
			this.$menu.addClass( _c.current );
 
			//	Close others
			glbl.$allMenus.not( this.$menu ).trigger( _e.close );
 
			//	Store style and position
			glbl.$page
				.data( _d.style, glbl.$page.attr( 'style' ) || '' )
				.data( _d.scrollTop, _scrollTop )
				.data( _d.offetLeft, glbl.$page.offset().left );
 
			//	Resize page to window width
			var _w = 0;
			glbl.$wndw
				.off( _e.resize )
				.on( _e.resize,
					function( e, force )
					{
						if ( force || glbl.$html.hasClass( _c.opened ) )
						{
							var nw = glbl.$wndw.width();
							if ( nw != _w )
							{
								_w = nw;
								glbl.$page.width( nw - glbl.$page.data( _d.offetLeft ) );
							}
						}
					}
				)
				.trigger( _e.resize, [ true ] );
 
			//	Prevent tabbing out of the menu
			if ( this.conf.preventTabbing )
			{
				glbl.$wndw
					.off( _e.keydown )
					.on( _e.keydown,
						function( e )
						{
							if ( e.keyCode == 9 )
							{
								e.preventDefault();
								return false;
							}
						}
					);
			}
 
			//	Add options
			if ( this.opts.modal )
			{
				glbl.$html.addClass( _c.modal );
			}
			if ( this.opts.moveBackground )
			{
				glbl.$html.addClass( _c.background );
			}
			if ( this.opts.position != 'left' )
			{
				glbl.$html.addClass( _c.mm( this.opts.position ) );
			}
			if ( this.opts.zposition != 'back' )
			{
				glbl.$html.addClass( _c.mm( this.opts.zposition ) );
			}
			if ( this.opts.classes )
			{
				glbl.$html.addClass( this.opts.classes );
			}
 
			//	Open
			glbl.$html.addClass( _c.opened );
			this.$menu.addClass( _c.opened );
 
			//	Scroll page to scrolltop
			glbl.$page.scrollTop( _scrollTop );
 
			//	Scroll menu to top
			this.$menu.scrollTop( 0 );
		},
		_openFinish: function()
		{
			var that = this;
 
			//	Callback
			transitionend( glbl.$page,
				function()
				{
					that.$menu.trigger( _e.opened );
				}, this.conf.transitionDuration
			);
 
			//	Opening
			glbl.$html.addClass( _c.opening );
			this.$menu.trigger( _e.opening );
 
			//	Scroll window to top
			window.scrollTo( 0, 1 );
		},
		close: function()
		{
			var that = this;
 
			//	Callback
			transitionend( glbl.$page,
				function()
				{
					that.$menu
						.removeClass( _c.current )
						.removeClass( _c.opened );
 
					glbl.$html
						.removeClass( _c.opened )
						.removeClass( _c.modal )
						.removeClass( _c.background )
						.removeClass( _c.mm( that.opts.position ) )
						.removeClass( _c.mm( that.opts.zposition ) );
 
					if ( that.opts.classes )
					{
						glbl.$html.removeClass( that.opts.classes );
					}
 
					glbl.$wndw
						.off( _e.resize )
						.off( _e.keydown );
 
					//	Restore style and position
					glbl.$page.attr( 'style', glbl.$page.data( _d.style ) );
 
					if ( glbl.$scrollTopNode )
					{
						glbl.$scrollTopNode.scrollTop( glbl.$page.data( _d.scrollTop ) );
					}
 
					//	Closed
					that.$menu.trigger( _e.closed );
 
				}, this.conf.transitionDuration
			);
 
			//	Closing
			glbl.$html.removeClass( _c.opening );
			this.$menu.trigger( _e.closing );
 
			return 'close';
		},
 
		_init: function()
		{
			this.opts = extendOptions( this.opts, this.conf, this.$menu );
			this.direction = ( this.opts.slidingSubmenus ) ? 'horizontal' : 'vertical';
 
			//	INIT PAGE & MENU
			this._initPage( glbl.$page );
			this._initMenu();
			this._initBlocker();
			this._initPanles();
			this._initLinks();
			this._initOpenClose();
			this._bindCustomEvents();
 
			if ( $[ _PLUGIN_ ].addons )
			{
				for ( var a = 0; a < $[ _PLUGIN_ ].addons.length; a++ )
				{
					if ( typeof this[ '_addon_' + $[ _PLUGIN_ ].addons[ a ] ] == 'function' )
					{
						this[ '_addon_' + $[ _PLUGIN_ ].addons[ a ] ]();
					}
				}
			}
		},
 
		_bindCustomEvents: function()
		{
			var that = this;
 
			this.$menu
				.off( _e.open + ' ' + _e.close + ' ' + _e.setPage+ ' ' + _e.update )
				.on( _e.open + ' ' + _e.close + ' ' + _e.setPage+ ' ' + _e.update,
					function( e )
					{
						e.stopPropagation();
					}
				);
 
			//	Menu-events
			this.$menu
				.on( _e.open,
					function( e )
					{
						if ( $(this).hasClass( _c.current ) )
						{
							e.stopImmediatePropagation();
							return false;
						}
						return that.open();
					}
				)
				.on( _e.close,
					function( e )
					{
						if ( !$(this).hasClass( _c.current ) )
						{
							e.stopImmediatePropagation();
							return false;
						}
						return that.close();
					}
				)
				.on( _e.setPage,
					function( e, $p )
					{
						that._initPage( $p );
						that._initOpenClose();
					}
				);
 
			//	Panel-events
			var $panels = this.$menu.find( this.opts.isMenu && this.direction != 'horizontal' ? 'ul, ol' : '.' + _c.panel );
			$panels
				.off( _e.toggle + ' ' + _e.open + ' ' + _e.close )
				.on( _e.toggle + ' ' + _e.open + ' ' + _e.close,
					function( e )
					{
						e.stopPropagation();
					}
				);
 
			if ( this.direction == 'horizontal' )
			{
				$panels
					.on( _e.open,
						function( e )
						{
							return openSubmenuHorizontal( $(this), that.$menu );
						}
					);
			}
			else
			{
				$panels
					.on( _e.toggle,
						function( e )
						{
							var $t = $(this);
							return $t.triggerHandler( $t.parent().hasClass( _c.opened ) ? _e.close : _e.open );
						}
					)
					.on( _e.open,
						function( e )
						{
							$(this).parent().addClass( _c.opened );
							return 'open';
						}
					)
					.on( _e.close,
						function( e )
						{
							$(this).parent().removeClass( _c.opened );
							return 'close';
						}
					);
			}
		},
 
		_initBlocker: function()
		{
			var that = this;
 
			if ( !glbl.$blck )
			{
				glbl.$blck = $( '<div id="' + _c.blocker + '" />' )
					.css( 'opacity', 0 )
					.appendTo( glbl.$body );
			}
 
			glbl.$blck
				.off( _e.touchstart )
				.on( _e.touchstart,
					function( e )
					{
						e.preventDefault();
						e.stopPropagation();
						glbl.$blck.trigger( _e.mousedown );
					}
				)
				.on( _e.mousedown,
					function( e )
					{
						e.preventDefault();
						if ( !glbl.$html.hasClass( _c.modal ) )
						{
							that.$menu.trigger( _e.close );
						}
					}
				);
		},
		_initPage: function( $p )
		{
			if ( !$p )
			{
				$p = $(this.conf.pageSelector, glbl.$body);
				if ( $p.length > 1 )
				{
					$[ _PLUGIN_ ].debug( 'Multiple nodes found for the page-node, all nodes are wrapped in one <' + this.conf.pageNodetype + '>.' );
					$p = $p.wrapAll( '<' + this.conf.pageNodetype + ' />' ).parent();
				}
			}
 
			$p.addClass( _c.page );
			glbl.$page = $p;
		},
		_initMenu: function()
		{
			var that = this;
 
			//	Clone if needed
			if ( this.conf.clone )
			{
				this.$menu = this.$menu.clone( true );
				this.$menu.add( this.$menu.find( '*' ) ).filter( '[id]' ).each(
					function()
					{
						$(this).attr( 'id', _c.mm( $(this).attr( 'id' ) ) );
					}
				);
			}
 
			//	Strip whitespace
			this.$menu.contents().each(
				function()
				{
					if ( $(this)[ 0 ].nodeType == 3 )
					{
						$(this).remove();
					}
				}
			);
 
			//	Prepend to body
			this.$menu
				.prependTo( 'body' )
				.addClass( _c.menu );
 
			//	Add direction class
			this.$menu.addClass( _c.mm( this.direction ) );
 
			//	Add options classes
			if ( this.opts.classes )
			{
				this.$menu.addClass( this.opts.classes );
			}
			if ( this.opts.isMenu )
			{
				this.$menu.addClass( _c.ismenu );
			}
			if ( this.opts.position != 'left' )
			{
				this.$menu.addClass( _c.mm( this.opts.position ) );
			}
			if ( this.opts.zposition != 'back' )
			{
				this.$menu.addClass( _c.mm( this.opts.zposition ) );
			}
		},
		_initPanles: function()
		{
			var that = this;
 
 
			//	Refactor List class
			this.__refactorClass( $('.' + this.conf.listClass, this.$menu), 'list' );
 
			//	Add List class