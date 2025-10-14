
function SettingsForm() {
  return (
    <div>
        <h1>Settings Form</h1>
        <form>
            <label>Username</label>
            <input type="text" name="username" />
            <label>Email</label>
            <input type="email" name="email" />
            <label>Password</label>
            <input type="password" name="password" />
            <button type="submit">Update</button>
            
        </form>
    </div>
  )
}

export default SettingsForm