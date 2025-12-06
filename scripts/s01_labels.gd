extends Node2D

# Shared constants for consistent positioning with dial
const DIAL_RADIUS: float = 360.0

func _draw() -> void:
	var font: Font = ThemeDB.fallback_font
	var r: float = DIAL_RADIUS * 0.95  # Slightly outside the dial circle (0.8)
	var center = Vector2(DIAL_RADIUS, DIAL_RADIUS)

	for i in range(0, 100):
		# Position 50 at top, then clockwise to match dial
		var angle: float = -PI/2 + ((float(i) - 50.0) / 100.0) * 2.0 * PI

		# Calculate position on circle
		var pos = center + Vector2(cos(angle), sin(angle)) * r

		# Draw the label centered at the calculated position
		var text = str(i)
		var color = Color.WHITE
		if i % 10 == 0:  # Highlight multiples of 10
			color = Color.YELLOW
			# Draw a small tick mark
			var tick_start = center + Vector2(cos(angle), sin(angle)) * (DIAL_RADIUS * 0.82)
			var tick_end = center + Vector2(cos(angle), sin(angle)) * (DIAL_RADIUS * 0.88)
			draw_line(tick_start, tick_end, Color.YELLOW, 2)
		elif i % 5 == 0:  # Smaller ticks for multiples of 5
			color = Color.LIGHT_GRAY
			var tick_start = center + Vector2(cos(angle), sin(angle)) * (DIAL_RADIUS * 0.84)
			var tick_end = center + Vector2(cos(angle), sin(angle)) * (DIAL_RADIUS * 0.86)
			draw_line(tick_start, tick_end, Color.LIGHT_GRAY, 1)

		# Draw text centered at pos using HORIZONTAL_ALIGNMENT_CENTER
		draw_string(font, pos, text, HORIZONTAL_ALIGNMENT_CENTER, -1, 16, color)

func _ready() -> void:
	queue_redraw()
