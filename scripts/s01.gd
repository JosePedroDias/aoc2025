extends Node2D
class_name S01

var location: int = 50
var zeroes: int = 0
var part2: bool = true

@onready var dial: Node2D = $S01_Dial
@onready var producer: Node = $S01_Producer

func _ready() -> void:
	if dial and dial.has_method("set_initial_position"):
		dial.set_initial_position(50)

func process_movement(direction: String, delta: int) -> void:
	# Update location and zeroes
	if part2:
		for i in range(delta):
			if direction == "R": location += 1
			else: location -= 1
			location = (location + 100) % 100
			if location == 0: zeroes += 1
	else:
		if direction == "R": location = (location + delta) % 100
		else: location = (100 + location - delta) % 100
		if location == 0: zeroes += 1

	# Rotate the dial
	if dial and dial.has_method("rotateByN"):
		var rotation_delta = delta if direction == "R" else -delta
		await dial.rotateByN(rotation_delta)

	#print("New location: %d, Zeroes: %d" % [location, zeroes])

func set_animation_delay(delay_ms: int) -> void:
	if dial and dial.has_method("set_animation_duration"):
		dial.set_animation_duration(delay_ms)
