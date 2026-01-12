from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.db.mongodb import mongodb
from app.models.user import UserCreate, User, UserInDB, Token, TokenData
from app.core.security import get_password_hash, verify_password, create_access_token, API_ALGORITHM
from app.core.config import settings
from jose import JWTError, jwt

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[API_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await mongodb.db["users"].find_one({"email": token_data.email})
    if user is None:
        raise credentials_exception
    
    return User(**user) # Convert to Pydantic model

@router.post("/register", response_model=User)
async def register(user_in: UserCreate):
    try:
        existing_user = await mongodb.db["users"].find_one({"email": user_in.email})
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="User with this email already exists"
            )
        
        hashed_password = get_password_hash(user_in.password)
        user_doc = user_in.model_dump()
        del user_doc["password"]
        user_doc["hashed_password"] = hashed_password
        
        new_user = await mongodb.db["users"].insert_one(user_doc)
        created_user = await mongodb.db["users"].find_one({"_id": new_user.inserted_id})
        return User(**created_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during registration: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await mongodb.db["users"].find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
