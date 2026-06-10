import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AdminLogin() {
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('login', login)
        .eq('password', password)
        .single()
        if (error || !data) {
            setError('Неверный логин или пароль')
        } else {
            localStorage.setItem('admin_authenticated', 'true')
            navigate('/admin')
        }
    }

    return (
    <div className="login min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="font-russo text-[72px] leading-[87px] mb-[150px] text-center">Вход в систему</div>
          <div className="flex flex-col items-center gap-[15px]">
            <form onSubmit={handleLogin} className="flex flex-col items-center gap-[15px]">
            <div className="input-group flex items-center gap-[10px]">
              <div className="bg-[#FFB36B] w-[50px] h-[50px] flex items-center justify-center rounded-[5px]">
                <span className="material-icons text-[30px]">account_circle</span>
              </div>
              <input
                type="text"
                placeholder="Логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="font-jost h-[50px] px-[16px] border-[#807D7D] rounded-[5px] w-[200px] text-black bg-white placeholder-[#807D7D]"
                required
              />
            </div>
            
            <div className="input-group flex items-center gap-[10px]">
              <div className="bg-[#FFB36B] w-[50px] h-[50px] flex items-center justify-center rounded-[5px]">
                <span className="material-icons text-[30px]">lock</span>
              </div>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-jost h-[50px] px-[16px] border-[#807D7D] rounded-[5px] w-[200px] text-black bg-white placeholder-[#807D7D]"
                required
              />
            </div>
            {error && <p className="text-red text-center">{error}</p>}
            <button
              type="submit"
              className="button_log bg-[#FFB36B] font-jost font-[500] text-[36px] leading-[52px] rounded-[20px] w-[292px] h-[65px] flex items-center justify-center px-0 transition-all border-none hover:cursor-pointer mt-[100px] mb-[50px]">
              Войти
            </button>
            </form>
          </div>
        </div>
    </div>
    )
}