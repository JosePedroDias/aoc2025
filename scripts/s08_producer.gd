extends Node

@onready var s08: S08 = $".."

var puzzle_name = "08a"
var part2: bool = true

func _find_distance_pairs(points: Array[Vector3]) -> Array[Array]:
	var perms: Array[Array] = Utils.perms2(points.size())
	var dists: Array[Array] = []
	for pair in perms:
		var i = pair[0]
		var j = pair[1]
		var a: Vector3 = points[i]
		var b: Vector3 = points[j]
		dists.push_back([a.distance_to(b), i, j])
	dists.sort_custom(func(a: Array, b: Array) -> bool: return a[0] < b[0])
	return dists

func _parse_puzzle(nm: String) -> void:
	var file: FileAccess = FileAccess.open("res://puzzles/%s.txt" % (nm), FileAccess.READ)
	if not file:
		print("Error: Could not open puzzle file: %s.txt" % nm)
		return

	var content: String = file.get_as_text()
	file.close()

	var lines: PackedStringArray = content.split("\n", false)

	var points: Array[Vector3] = []
	for line in lines:
		if line == "": continue
		var parts = line.split(",", false)
		var p = Vector3( float(parts[0]), float(parts[1]), float(parts[2]) )
		points.push_back(p)
	
	var dists = _find_distance_pairs(points)
	
	s08.points = points
	s08.dists = dists
	s08.connections_left = 1000 if puzzle_name == "08" else 10
	s08.part2 = part2
	s08.go()
	
func _ready() -> void:
	await get_tree().process_frame
	_parse_puzzle(puzzle_name)
	
