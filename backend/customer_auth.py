from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database import get_db
import models
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

customer_oauth2 = OAuth2PasswordBearer(tokenUrl="customers/login")


def get_current_customer(
    token: str = Depends(customer_oauth2),
    db: Session = Depends(get_db),
) -> models.Customer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    try:
        payload     = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        customer_id = payload.get("sub")
        role        = payload.get("role")
        if customer_id is None or role != "customer":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    customer = db.query(models.Customer).filter(
        models.Customer.id == customer_id
    ).first()
    if customer is None:
        raise credentials_exception
    return customer