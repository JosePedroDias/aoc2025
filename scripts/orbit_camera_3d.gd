extends Camera3D

var target_position: Vector3 = Vector3.ZERO
var camera_distance: float = 10.0
var rotation_speed: float = 2.0
var min_distance: float = 2.0
var max_distance: float = 100.0
var mouse_sensitivity: float = 0.005
var is_rotating: bool = false
var last_mouse_position: Vector2
var orbital_rotation: Vector2 = Vector2.ZERO  # x = horizontal, y = vertical

func _ready():
	# Set initial position
	update_camera_position()

func _input(event):
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			is_rotating = event.pressed
			if is_rotating:
				last_mouse_position = event.position
		elif event.button_index == MOUSE_BUTTON_WHEEL_UP:
			zoom_in()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			zoom_out()
	elif event is InputEventMouseMotion and is_rotating:
		var delta = event.position - last_mouse_position
		orbital_rotation.x -= delta.x * mouse_sensitivity
		orbital_rotation.y -= delta.y * mouse_sensitivity
		# Clamp vertical rotation to prevent flipping
		orbital_rotation.y = clamp(orbital_rotation.y, -PI/2 + 0.1, PI/2 - 0.1)
		update_camera_position()
		last_mouse_position = event.position
	elif event is InputEventKey and event.pressed:
		if event.keycode == KEY_Z:
			zoom_in()
		elif event.keycode == KEY_X:
			zoom_out()
		elif event.keycode == KEY_F11:
			# Toggle fullscreen
			if DisplayServer.window_get_mode() == DisplayServer.WINDOW_MODE_FULLSCREEN:
				DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
			else:
				DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_FULLSCREEN)
		elif event.keycode == KEY_ESCAPE:
			# Quit the game
			get_tree().quit()

func zoom_in():
	# Use percentage-based zoom for more dramatic effect
	camera_distance = max(camera_distance * 0.8, min_distance)
	update_camera_position()

func zoom_out():
	# Use percentage-based zoom for more dramatic effect
	camera_distance = min(camera_distance * 1.25, max_distance)
	update_camera_position()

func update_camera_position():
	# Calculate position using spherical coordinates
	var x = cos(orbital_rotation.y) * sin(orbital_rotation.x)
	var y = sin(orbital_rotation.y)
	var z = cos(orbital_rotation.y) * cos(orbital_rotation.x)
	var offset = Vector3(x, y, z) * camera_distance
	position = target_position + offset
	# Always look at the target
	look_at(target_position, Vector3.UP)

func set_target_and_distance(target: Vector3, distance: float):
	target_position = target
	camera_distance = distance
	max_distance = distance * 3.0
	min_distance = distance * 0.1

	# Set appropriate near and far clipping planes based on the scale
	# Near plane should be small enough to see close objects, but not too small to avoid z-fighting
	# Far plane should be large enough to see the entire scene
	near = max(distance * 0.001, 0.1)  # At least 0.1, but scale with distance
	far = distance * 10.0  # Far enough to see the entire scene with padding

	print("Camera clipping planes - near: %s, far: %s" % [near, far])
	update_camera_position()
