exports.userRes = (user) => {
    const user_Res = user.toObject();
    delete user_Res.password;
    delete user_Res.__v;
    return user_Res;
} 