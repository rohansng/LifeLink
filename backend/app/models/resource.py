"""Emergency resource and supply cache data model for LifeLink."""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from backend.app.models.location import Location


class ResourceCategory(str, Enum):
    MEDICAL_SUPPLIES = "medical_supplies"
    HAZMAT = "hazmat"
    AIR_TRANSPORT = "air_transport"
    INFRASTRUCTURE = "infrastructure"
    BLOOD_BANK = "blood_bank"


class ResourceStatus(str, Enum):
    AVAILABLE = "available"
    DEPLOYED = "deployed"
    IN_TRANSIT = "in_transit"
    DEPLETED = "depleted"


class Resource(BaseModel):
    id: str = Field(..., description="Unique resource ID, e.g. RES-01")
    name: str = Field(..., description="Equipment or supply name")
    category: ResourceCategory = Field(..., description="Category of resource")
    status: ResourceStatus = Field(default=ResourceStatus.AVAILABLE)
    quantity: int = Field(default=1, ge=0)
    unit: str = Field(default="units", description="units, kits, pods, aircraft")
    location: Location = Field(..., description="Current resource position or depot")
    allocated_to: Optional[str] = Field(None, description="Assigned incident sector or hospital")
    notes: Optional[str] = Field(None)


class ResourceUpdate(BaseModel):
    status: Optional[ResourceStatus] = None
    quantity: Optional[int] = None
    allocated_to: Optional[str] = None
