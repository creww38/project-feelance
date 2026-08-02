import supabase from '../config/supabase';

export class UserRepository {
  async findAll(options: any, where: any = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('users')
      .select('*, user_roles!inner(role_id, roles!inner(id, nama))', { count: 'exact' });

    if (where.email) {
      query = query.ilike('email', `%${where.email}%`);
    }
    if (where.username) {
      query = query.ilike('username', `%${where.username}%`);
    }
    if (where.isActive !== undefined) {
      query = query.eq('is_active', where.isActive);
    }

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data
    const items = data?.map((user: any) => ({
      ...user,
      userRoles: user.user_roles?.map((ur: any) => ({
        role: ur.roles,
      })),
    })) || [];

    return {
      items,
      meta: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: page < Math.ceil((count || 0) / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_roles(role_id, roles(id, nama))')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      userRoles: data.user_roles?.map((ur: any) => ({
        role: ur.roles,
      })),
    };
  }

  async findByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_roles(role_id, roles(id, nama))')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;

    return {
      ...data,
      userRoles: data.user_roles?.map((ur: any) => ({
        role: ur.roles,
      })),
    };
  }

  async findByUsername(username: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*, user_roles(role_id, roles(id, nama))')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    if (!data) return null;

    return {
      ...data,
      userRoles: data.user_roles?.map((ur: any) => ({
        role: ur.roles,
      })),
    };
  }

  async create(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        nama_lengkap: userData.namaLengkap,
        no_telp: userData.noTelp,
        alamat: userData.alamat,
        jenis_kelamin: userData.jenisKelamin,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    // If role specified, assign role
    if (userData.role) {
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('nama', userData.role)
        .single();

      if (roleData) {
        await supabase
          .from('user_roles')
          .insert({ user_id: data.id, role_id: roleData.id });
      }
    }

    return data;
  }

  async update(id: string, userData: any) {
    const updateData: any = {};
    
    if (userData.namaLengkap) updateData.nama_lengkap = userData.namaLengkap;
    if (userData.email) updateData.email = userData.email;
    if (userData.username) updateData.username = userData.username;
    if (userData.password) updateData.password = userData.password;
    if (userData.noTelp !== undefined) updateData.no_telp = userData.noTelp;
    if (userData.alamat !== undefined) updateData.alamat = userData.alamat;
    if (userData.foto !== undefined) updateData.foto = userData.foto;
    if (userData.isActive !== undefined) updateData.is_active = userData.isActive;
    if (userData.lastLogin) updateData.last_login = userData.lastLogin;
    if (userData.refreshToken !== undefined) updateData.refresh_token = userData.refreshToken;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async count() {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (error) throw error;
    return count || 0;
  }
}