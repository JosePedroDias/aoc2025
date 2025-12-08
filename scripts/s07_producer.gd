extends Node

@onready var s07: S07 = $".."

var puzzle_name = "07a"

func _parse_puzzle(nm: String) -> void:
	var file: FileAccess = FileAccess.open("res://puzzles/%s.txt" % (nm), FileAccess.READ)
	if not file:
		print("Error: Could not open puzzle file: %s.txt" % nm)
		return

	var content: String = file.get_as_text()
	file.close()

	var lines: PackedStringArray = content.split("\n", false)
	
	var width = lines[0].length()
	var height = lines.size()
	
	var start_position: Vector2i
	var splitter_positions: Dictionary = {}
	var board: Board = Board.new(width, height)
	
	for y in range(height):
		var line = lines[y]
		for x in range(width):
			var chr = line[x]
			if chr == "S": start_position = Vector2i(x, y)
			elif chr == "^": splitter_positions[Vector2i(x, y)] = true
			board.set_cell(Vector2i(x, y), chr)
	#print(board)
	
	s07.start_position = start_position
	s07.splitter_positions = splitter_positions
	s07.board = board
	s07.part1()
	s07.part2()
	
func _ready() -> void:
	await get_tree().process_frame
	_parse_puzzle(puzzle_name)
	
