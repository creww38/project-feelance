import supabase from './supabase';

export const connectDB = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('📦 Database connected successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
};

export const disconnectDB = async (): Promise<void> => {
  console.log('Database disconnected');
};

export default supabase;