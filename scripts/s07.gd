extends Node2D
class_name S07

var start_position: Vector2i
var splitter_positions: Dictionary
var board: Board

func part1() -> void:
	var y: int = start_position.y
	var xs: Dictionary = {}
	xs[start_position.x] = true
	var splits = 0;
	while y < board.get_height() - 1:
		y += 1
		var xs2: Dictionary = {}
		for x in xs:
			if Vector2i(x, y) in splitter_positions:
				splits += 1
				xs2[x - 1] = true
				xs2[x + 1] = true
			else:
				xs2[x] = true
		xs = xs2
		for x in xs: board.set_cell(Vector2i(x, y), "|")
		#print(board)
	print("splits: %d" % [splits])

func part2() -> void:
	var y: int = start_position.y
	var xs: Histogram = Histogram.new()
	xs.inc(start_position.x);
	while y < board.get_height() - 1:
		y += 1
		var xs2: Histogram = Histogram.new()
		for x in xs.keys():
			var count: int = xs.get_count(x)
			if Vector2i(x, y) in splitter_positions:
				xs2.add(x - 1, count)
				xs2.add(x + 1, count)
			else:
				xs2.add(x, count)
		xs = xs2
	print("total: %d" % xs.sum())
