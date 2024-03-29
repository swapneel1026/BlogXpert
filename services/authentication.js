import JWT from "jsonwebtoken";

const secret = "swapneel@@@@#!";

export function createToken(user) {
  const payload = {
    email: user.email,
    fullName: user.fullName,
    id: user._id,
    profileImageUrl: user.profileImageUrl,
  };
  const token = JWT.sign(payload, secret);
  return token;
}

export function verifyToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}
