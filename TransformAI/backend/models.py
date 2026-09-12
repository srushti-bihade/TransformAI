from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from database import Base


# --------------------------------------------------
# USER
# --------------------------------------------------

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String,
        unique=True,
        index=True,
        nullable=False
    )

    password = Column(
        String,
        nullable=False
    )


# --------------------------------------------------
# DOCUMENT
# --------------------------------------------------

class Document(Base):

    __tablename__ = "documents"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    filename = Column(
        String,
        nullable=False
    )

    sha256_hash = Column(
        String,
        nullable=False
    )


# --------------------------------------------------
# AUDIT LOG
# --------------------------------------------------

class AuditLog(Base):

    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_email = Column(
        String,
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )

    details = Column(
        String,
        nullable=True
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )