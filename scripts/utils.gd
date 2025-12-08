extends Node

func perms2(n: int) -> Array[Array]:
	var res: Array[Array] = []
	for i in range(n):
		for j in range(i):
			var pair = [j, i]
			res.push_back(pair)
	res.sort_custom(func(a, b): return a[0] < b[0])
	return res
