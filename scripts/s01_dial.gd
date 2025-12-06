extends Node2D

var current_angle: float = 0  # Current dial angle in radians
var animation_duration_ms: int = 0
var tween: Tween

# Triangle geometry (created once)
var triangle_points: PackedVector2Array
var triangle_center: Vector2

# Shared constants for consistent positioning
const DIAL_RADIUS: float = 360.0

func _draw() -> void:
	# Use the same center as triangle_center for consistency

	# Draw the triangle using the pre-calculated points, rotated by current_angle
	var rotated_points = PackedVector2Array()
	for point in triangle_points:
		# Rotate point around triangle_center by current_angle
		var relative_pos = point - triangle_center
		var rotated_pos = Vector2(
			relative_pos.x * cos(current_angle) - relative_pos.y * sin(current_angle),
			relative_pos.x * sin(current_angle) + relative_pos.y * cos(current_angle)
		)
		rotated_points.append(triangle_center + rotated_pos)

	# Draw the triangle
	draw_colored_polygon(rotated_points, Color.RED)

	# Draw border by creating a closed polyline
	var border_points = PackedVector2Array()
	for point in rotated_points:
		border_points.append(point)
	border_points.append(rotated_points[0])  # Close the polygon
	draw_polyline(border_points, Color.DARK_RED, 2.0)

func _ready() -> void:
	_create_triangle_geometry()
	queue_redraw()

func _create_triangle_geometry() -> void:
	var r: float = DIAL_RADIUS * 0.9  # Triangle radius - same as labels for consistent distance
	triangle_center = Vector2(DIAL_RADIUS, DIAL_RADIUS)

	# Create triangle points pointing upward (angle = -PI/2)
	# This is the base orientation for position 50
	var base_angle: float = -PI/2
	var triangle_height: float = 60.0  # Distance from tip to base
	var triangle_base_width: float = 0.1  # Angular width of base in radians (smaller = narrower base)

	var point1 = triangle_center + Vector2(cos(base_angle), sin(base_angle)) * r  # Tip pointing outward
	var point2 = triangle_center + Vector2(cos(base_angle + triangle_base_width), sin(base_angle + triangle_base_width)) * (r - triangle_height)  # Base left
	var point3 = triangle_center + Vector2(cos(base_angle - triangle_base_width), sin(base_angle - triangle_base_width)) * (r - triangle_height)  # Base right

	triangle_points = PackedVector2Array([point1, point2, point3])

# Set initial position (called from main script)
func set_initial_position(pos: float) -> void:
	# Convert position to angle: position 50 = 0 radians, then clockwise
	current_angle = ((pos - 50.0) / 100.0) * 2.0 * PI
	queue_redraw()

# Rotate by N positions with animation
func rotateByN(delta: int) -> void:
	# Calculate rotation angle change from delta
	var angle_change = (float(delta) / 100.0) * 2.0 * PI
	var new_angle = current_angle + angle_change

	if animation_duration_ms == 0:
		current_angle = new_angle
		queue_redraw()
		return

	# Create tween for smooth animation
	if tween:
		tween.kill()

	tween = create_tween()
	var duration = animation_duration_ms / 1000.0

	# Animate the angle change
	tween.tween_method(
		func(value: float):
			current_angle = value
			queue_redraw(),
		current_angle,
		new_angle,
		duration
	)

	# Wait for animation to complete
	await tween.finished

# Set custom animation duration
func set_animation_duration(duration_ms: int) -> void:
	animation_duration_ms = duration_ms
