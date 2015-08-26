iconsPath = 'icons.svg'

#==============
# Util
#==============

Snap.plugin (Snap, Element) ->
	Element::hover = (f_in, f_out, s_in, s_out) ->
		@mouseover f_in, s_in
			.mouseout f_out or f_in, s_out or s_in


polarToCartesian = (cx, cy, r, angle) ->
	angle = (angle - 90) * Math.PI / 180 # Degrees to radius
	x: cx + r * Math.cos angle
	y: cy + r * Math.sin angle

describeArc = (x, y, r, startAngle, endAngle, continueLine) ->
	start = polarToCartesian x, y, r, startAngle %= 360
	end = polarToCartesian x, y, r, endAngle %= 360
	large = Math.abs(endAngle - startAngle) >= 180
	alter = endAngle > startAngle
	"#{if continueLine then 'L' else 'M'}#{start.x},#{start.y}
	A#{r},#{r},0,
	#{if large then 1 else 0},
	#{if alter then 1 else 0},#{end.x},#{end.y}"

describeSector = (x, y, r, r2, startAngle, endAngle) ->
	"#{describeArc x, y, r, startAngle, endAngle}
	#{describeArc x, y, r2, endAngle, startAngle, on}Z"

animate = (obj, index, start, end, duration, easing, fn, cb) ->
	do (obj.animation ?= [])[index]?.stop
	obj.animation[index] = Snap.animate start, end, fn, duration, easing, cb



#==============
# GUI
#==============

class GUI
	constructor: (buttons) ->
		@paper = Snap window.innerWidth, window.innerHeight
		Snap.load iconsPath, (icons) =>
			@nav = new RadialNav @paper, buttons, icons

			do @_bindEvents

#==============
# Private
#==============

	_bindEvents: ->
		window.addEventListener 'resize', =>
			@paper.attr
				width: window.innerWidth
				height: window.innerHeight

		@paper.node.addEventListener 'mousedown', @nav.show.bind @nav
		@paper.node.addEventListener 'mouseup', @nav.hide.bind @nav

#==============
# Radial nav
#==============

class RadialNav
	constructor: (paper, buttons, icons) ->
		@area = paper
			.svg 0, 0, @size = 500, @size
			.addClass 'radialnav'
		@c = @size / 2 #center
		@r = @size * .25 #outer radius
		@r2 = @r * .35 # inner radius
		@angle = 360 / buttons.length
		@animateDuration = 300

		@container = do @area.g
		@container.transform "s0"

		@updateButtons buttons, icons

	#==============
	# Private
	#==============

	_animateContainer: (start, end, duration, easing) ->
		animate @, 0, start, end, duration, easing, (val) =>
			@container.transform "r#{90 - 90 * val},#{@c},#{@c}s#{val},#{val},#{@c},#{@c}"

	_animateButtonHover: (button, start, end, duration, easing, cb) ->
		animate button, 1, start, end, duration, easing, ((val) =>
			button[0].attr d: describeSector @c, @c, @r - val * 10, @r2, 0, @angle
			button[2].transform "S#{1.1 - val * .1},#{1.1 - val * .1},#{@c},#{@c}"
		), cb

	_sector: ->
		@area
			.path describeSector @c, @c, @r, @r2, 0, @angle
			.addClass 'radialnav-sector'

	_icon: (btn, icons) ->
		icon = icons
			.select "##{btn.icon}"
			.addClass 'radialnav-icon'
		bbox = do icon.getBBox
		icon.transform "
		T#{@c - bbox.x - bbox.width / 2},#{@c - @r + @r2 - bbox.y - bbox.height / 2 - 5}
		R#{@angle / 2},#{@c},#{@c}S.7"

	_hint: (btn) ->
		hint = @area
			.text 0, 0, btn.icon
			.addClass 'radialnav-hint hide'
			.attr textpath: describeArc @c, @c, @r, 0, @angle
		hint.select('*').attr startOffset: '50%'
		hint

	_button: (btn, sector, icon, hint) ->
		@area
			.g sector, icon, hint
			.hover -> el.toggleClass 'active' for el in [@[0], @[1], @[2]]
			.hover @_buttonOver(@), @_buttonOut(@)

	_buttonOver: (nav) -> ->
		nav._animateButtonHover @, 0, 1, 200, mina.easeinout
		@[2].removeClass 'hide'

	_buttonOut: (nav) -> ->
		nav._animateButtonHover @, 1, 0, 2000, mina.elastic, (->
			@addClass 'hide').bind @[2]

	#==============
	# Pulic
	#==============

	updateButtons: (buttons, icons) ->
		do @container.clear
		for btn, i in buttons
			button = @_button btn, @_sector(), @_icon(btn, icons), @_hint(btn)
			button.transform "r#{@angle * i},#{@c},#{@c}"
			@container.add button


	show: (e) ->
		@area.attr x: e.clientX - @c, y: e.clientY - @c
		@_animateContainer 0, 1, @animDuration * 8, mina.elastic

	hide: ->
		@_animateContainer 1, 0, @animDuration, mina.easeinout

#==============
# test
#==============

gui = new GUI [
	{
		icon: 'pin'
		action: ->
			console.log 'Pinning...'
	}
	{
		icon: 'search'
		action: ->
			console.log 'Opening search...'
	}
	{
		icon: 'cloud'
		action: ->
			console.log 'Connecting to Cloud...'
	}
	{
		icon: 'settings'
		action: ->
			console.log 'Opening Setting...'
	}
	{
		icon: 'rewind'
		action: ->
			console.log 'Rewinding...'
	}
	{
		icon: 'preview'
		action: ->
			console.log 'Preview Activated'
	}
	{
		icon: 'delete'
		action: ->
			console.log 'Deleting...'
	}
]