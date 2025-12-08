class_name Board
extends RefCounted

# Generic 2D board backed by a Dictionary

var _data: Dictionary = {}
var _width: int
var _height: int
var _default_value

func _init(width: int, height: int, default_value = null):
	_width = width
	_height = height
	_default_value = default_value

func get_width() -> int:
	return _width

func get_height() -> int:
	return _height

func get_cell(k: Vector2i):
	return _data.get(k, _default_value)

func set_cell(k: Vector2i, value):
	if value == _default_value: _data.erase(k)
	else: _data[k] = value

func unset_cell(k: Vector2i):
	_data.erase(k)

func has_cell(k: Vector2i) -> bool:
	return _data.has(k)

func clear() -> void:
	_data.clear()

func _to_string() -> String:
	var result = ""
	for y in _height:
		var line = ""
		for x in _width:
			var value = get_cell(Vector2i(x, y))
			if value == _default_value:
				line += "."
			else:
				line += str(value)
		result += line + "\n"
	return result

func is_in_bounds(k: Vector2i) -> bool:
	return k.x >= 0 and k.x < _width and k.y >= 0 and k.y < _height
