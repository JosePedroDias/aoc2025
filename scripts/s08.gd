extends Node3D
class_name S08

var points: Array[Vector3] = []
var dists: Array[Array] = [] # [dist, i, j]
var bounds: Dictionary
var clusters: Array[Array] = []
var part2: bool = false
var connections_left: int = 10
var sphere_radius: float = 20.0  # Will be calculated based on bounds

@onready var camera: Camera3D = $Camera3D

func find_cluster_having(el: int) -> int:
	for i in range(clusters.size()):
		var cl = clusters[i]
		var res = cl.find(el)
		if res != -1: return i
	return -1

func go() -> void:
	bounds = _calc_bounds()
	var center = bounds["center"]
	var max_distance = bounds["max_distance"]

	# Calculate appropriate sphere radius based on the scale of the data
	# Use a fraction of the max distance to ensure spheres are visible
	sphere_radius = max_distance * 0.01  # 1% of the max distance

	print("# points: %d" % [points.size()])
	print("# dists: %d" % [dists.size()])
	print("bounds: %s %s" % [center, max_distance])
	print("sphere radius: %s" % [sphere_radius])
	camera.set_target_and_distance(center, max_distance)

	for p in points: _create_sphere(p)
	
	for i in range(points.size()): clusters.push_back([i])
	
	var take_dists = dists if part2 else dists.slice(0, connections_left)
	for d in take_dists:
		var i = d[1]
		var j = d[2]
		var cl_i_idx = find_cluster_having(i)
		var cl_j_idx = find_cluster_having(j)
		
		#print("* i %d (c: %d}), j %d (c: %d) *" % [i, cl_i_idx, j, cl_j_idx])
		
		_connect_spheres(points[i], points[j])

		if cl_i_idx == cl_j_idx:
			#print("i and j are in the same cluster. nothing to do.")
			pass
		else:
			#print("joining clusters %d with %d..." % [cl_i_idx, cl_j_idx])
			var cl_i = clusters[cl_i_idx]
			var cl_j = clusters[cl_j_idx]
			var merged_cl = Array(cl_i)
			merged_cl.append_array(cl_j)
			clusters = clusters.filter(func(el): return el != cl_i and el != cl_j)
			clusters.append(merged_cl)
			if clusters.size() == 1:
				var xi = points[i][0];
				var xj = points[j][0];
				print("part 2: xi: %d, xj: %d => xi*xj: %d" % [xi, xj, xi * xj]);
				break;
	
	if not part2:
		var cluster_sizes: Array = clusters.map(func(c): return c.size())
		cluster_sizes.sort()
		cluster_sizes.reverse()
		var res_part1: int = 1
		for i in range(3): res_part1 *= cluster_sizes[i]
		print("part 1: %d" % [res_part1])

func _create_sphere(p: Vector3) -> void:
	var mesh_instance = MeshInstance3D.new()
	var sphere_mesh = SphereMesh.new()
	sphere_mesh.height = sphere_radius * 2
	sphere_mesh.radius = sphere_radius
	mesh_instance.mesh = sphere_mesh
	var material = StandardMaterial3D.new()
	material.albedo_color = Color(randf(), randf(), randf(), 1.0)
	mesh_instance.material_override = material
	mesh_instance.position = p
	add_child(mesh_instance)

func _connect_spheres(p1: Vector3, p2: Vector3) -> void:
	var radius = sphere_radius * 0.25  # Make cylinder radius proportional to sphere radius
	
	var direction = p2 - p1
	var distance = direction.length()
	var midpoint = (p1 + p2) * 0.5
	
	var cylinder_mesh = CylinderMesh.new()
	cylinder_mesh.height = distance
	cylinder_mesh.top_radius = radius
	cylinder_mesh.bottom_radius = radius
	cylinder_mesh.radial_segments = 16
	
	# Create mesh instance
	var mesh_instance = MeshInstance3D.new()
	mesh_instance.mesh = cylinder_mesh
	
	var material = StandardMaterial3D.new()
	material.albedo_color = Color(randf(), randf(), randf(), 1.0)
	mesh_instance.material_override = material
	
	mesh_instance.position = midpoint
	
	# Rotate to align with direction vector (CylinderMesh is oriented along Y-axis by default)
	if direction.length() > 0.001: # Avoid division by zero
		var up_vector = Vector3.UP
		# If direction is parallel to up vector, use a different up vector
		if abs(direction.normalized().dot(up_vector)) > 0.99:
			up_vector = Vector3.RIGHT
		# Create transform that looks from point1 toward point2
		var trans = Transform3D()
		trans.origin = midpoint
		trans = trans.looking_at(p2, up_vector)
		# Rotate 90 degrees around X to align cylinder's Y-axis with direction
		trans.basis = trans.basis * Basis(Vector3.RIGHT, PI/2)
		mesh_instance.transform = trans
	add_child(mesh_instance)

func _calc_bounds() -> Dictionary:
	if points.is_empty(): return {"center": Vector3.ZERO, "max_distance": 10.0}
	var min_bounds = Vector3()
	var max_bounds = Vector3()

	for p in points:
		min_bounds.x = min(min_bounds.x, p.x)
		min_bounds.y = min(min_bounds.y, p.y)
		min_bounds.z = min(min_bounds.z, p.z)
		max_bounds.x = max(max_bounds.x, p.x)
		max_bounds.y = max(max_bounds.y, p.y)
		max_bounds.z = max(max_bounds.z, p.z)
	
	var center = (min_bounds + max_bounds) * 0.5
	var size = max_bounds - min_bounds
	var max_distance = max(size.x, max(size.y, size.z)) * 1.5  # Add some padding
	return {"center": center, "max_distance": max_distance}
