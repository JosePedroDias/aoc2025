extends Node

@onready var s01: S01 = $".."

# RELEVANT VARIABLES
var part2: bool = false
var animation_delay_ms: int = 250 # use zero to skip animation
var puzzle_name = "01a"

func parse_puzzle(nm: String) -> void:
	var file: FileAccess = FileAccess.open("res://puzzles/%s.txt" % (nm), FileAccess.READ)
	if not file:
		print("Error: Could not open puzzle file: %s.txt" % nm)
		return

	var content: String = file.get_as_text()
	file.close()

	var lines: PackedStringArray = content.split("\n", false)
	print("# lines: %d, estimated time: %.2f s" % [lines.size(), float(lines.size() * animation_delay_ms) / 1000.0])

	for line in lines:
		if line.length() < 2: continue
		var direction = line.substr(0, 1)
		var delta = line.substr(1).to_int()
		s01.process_movement(direction, delta)
		if animation_delay_ms > 0: await get_tree().create_timer(animation_delay_ms / 1000.0).timeout

	print("Final location: %d, Zeroes: %d" % [s01.location, s01.zeroes])

func _ready() -> void:
	await get_tree().process_frame
	s01.part2 = part2
	s01.set_animation_delay(animation_delay_ms)
	parse_puzzle(puzzle_name)
	
