class_name Histogram
extends RefCounted

var _d: Dictionary[int, int] = {}

func has(key: int) -> bool:
	return _d.has(key)

func inc(key: int) -> void:
	_d[key] = _d.get(key, 0) + 1

func add(key: int, delta_value: int) -> void:
	_d[key] = _d.get(key, 0) + delta_value

func get_count(key: int) -> int:
	return _d[key]

func sum() -> int:
	var _sum: int = 0
	for v in _d.values(): _sum += v
	return _sum

func keys() -> Array[int]:
	return _d.keys()
