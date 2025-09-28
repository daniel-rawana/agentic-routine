from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
import json
from ..utils.supabase import get_supabase

router = APIRouter(prefix="/api", tags=["user"])

class UserProfile(BaseModel):
    user_id: str
    xp: int
    coins: int
    level: int
    streak: int

class UserPurchase(BaseModel):
    shop_item_id: str
    name: str
    description: str
    coin_price: int

class ShopItem(BaseModel):
    id: str
    name: str
    description: str
    coin_price: int

@router.post("/validate-user/{user_id}")
async def validate_user(user_id: str):
    """Validate user and create profile if doesn't exist"""
    try:
        print(f"🔍 [DEBUG] Validating user: {user_id}")
        
        supabase = get_supabase()
        
        # Check if user profile exists
        result = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
        
        print(f"🔍 [DEBUG] Profile query result: {result.data}")
        
        if not result.data:
            print(f"🔍 [DEBUG] User profile not found, creating new profile for: {user_id}")
            
            # Create new user profile with default values
            new_profile = {
                "user_id": user_id,
                "xp": 0,
                "coins": 100,  # Starting coins
                "level": 1,
                "streak": 0
            }
            
            create_result = supabase.table("user_profiles").insert(new_profile).execute()
            print(f"✅ [DEBUG] New profile created: {create_result.data}")
            
            return {
                "exists": False,
                "created": True,
                "profile": new_profile
            }
        else:
            print(f"✅ [DEBUG] User profile found: {result.data[0]}")
            return {
                "exists": True,
                "created": False,
                "profile": result.data[0]
            }
            
    except Exception as e:
        print(f"❌ [DEBUG] Error validating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile data"""
    try:
        print(f"🔍 [DEBUG] Getting profile for user: {user_id}")
        
        supabase = get_supabase()
        
        # Get user profile
        result = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
        
        print(f"🔍 [DEBUG] Profile data: {result.data}")
        
        if not result.data:
            print(f"❌ [DEBUG] User profile not found: {user_id}")
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile_data = result.data[0]
        
        # Calculate additional values
        current_level_xp = profile_data["level"] * 100  # 100 XP per level
        xp_for_next_level = current_level_xp - profile_data["xp"]
        
        print(f"✅ [DEBUG] Profile retrieved successfully for user: {user_id}")
        
        return {
            "user_id": profile_data["user_id"],
            "xp": profile_data["xp"],
            "coins": profile_data["coins"],
            "level": profile_data["level"],
            "streak": profile_data["streak"],
            "xp_for_next_level": max(0, xp_for_next_level),  # Ensure non-negative
            "progress_percentage": min(100, (profile_data["xp"] % 100))  # Progress within current level
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [DEBUG] Error getting user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/purchases/{user_id}")
async def get_user_purchases(user_id: str):
    """Get user purchases with shop item details"""
    try:
        print(f"🔍 [DEBUG] Getting purchases for user: {user_id}")
        
        supabase = get_supabase()
        
        # Get user purchases with shop item details (JOIN query)
        result = supabase.table("user_purchases").select(
            "shop_item_id, shop_items(id, name, description, coin_price)"
        ).eq("user_id", user_id).execute()
        
        print(f"🔍 [DEBUG] Purchases query result: {result.data}")
        
        purchases = []
        for purchase in result.data:
            shop_item = purchase["shop_items"]
            if shop_item:  # Ensure shop item exists
                purchases.append({
                    "shop_item_id": shop_item["id"],
                    "name": shop_item["name"],
                    "description": shop_item["description"],
                    "coin_price": shop_item["coin_price"]
                })
        
        print(f"✅ [DEBUG] Found {len(purchases)} purchases for user: {user_id}")
        
        return {
            "user_id": user_id,
            "purchases": purchases,
            "total_purchased": len(purchases)
        }
        
    except Exception as e:
        print(f"❌ [DEBUG] Error getting user purchases: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/shop")
async def get_shop_items():
    """Get all available shop items"""
    try:
        print(f"🔍 [DEBUG] Getting all shop items")
        
        supabase = get_supabase()
        
        # Get all shop items
        result = supabase.table("shop_items").select("*").order("coin_price").execute()
        
        print(f"🔍 [DEBUG] Shop items query result: {len(result.data)} items found")
        
        shop_items = []
        for item in result.data:
            shop_items.append({
                "id": item["id"],
                "name": item["name"],
                "description": item["description"],
                "coin_price": item["coin_price"]
            })
        
        print(f"✅ [DEBUG] Retrieved {len(shop_items)} shop items")
        
        return {
            "shop_items": shop_items,
            "total_items": len(shop_items)
        }
        
    except Exception as e:
        print(f"❌ [DEBUG] Error getting shop items: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/purchase/{user_id}/{shop_item_id}")
async def purchase_item(user_id: str, shop_item_id: str):
    """Purchase a shop item"""
    try:
        print(f"🔍 [DEBUG] Processing purchase: user {user_id}, item {shop_item_id}")
        
        supabase = get_supabase()
        
        # Get user profile to check coins
        profile_result = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
        
        if not profile_result.data:
            print(f"❌ [DEBUG] User profile not found for purchase: {user_id}")
            raise HTTPException(status_code=404, detail="User profile not found")
        
        user_profile = profile_result.data[0]
        print(f"🔍 [DEBUG] User has {user_profile['coins']} coins")
        
        # Get shop item to check price
        item_result = supabase.table("shop_items").select("*").eq("id", shop_item_id).execute()
        
        if not item_result.data:
            print(f"❌ [DEBUG] Shop item not found: {shop_item_id}")
            raise HTTPException(status_code=404, detail="Shop item not found")
        
        shop_item = item_result.data[0]
        print(f"🔍 [DEBUG] Item costs {shop_item['coin_price']} coins")
        
        # Check if user has enough coins
        if user_profile["coins"] < shop_item["coin_price"]:
            print(f"❌ [DEBUG] Insufficient coins: has {user_profile['coins']}, needs {shop_item['coin_price']}")
            raise HTTPException(status_code=400, detail="Insufficient coins")
        
        # Check if already purchased
        existing_purchase = supabase.table("user_purchases").select("*").eq("user_id", user_id).eq("shop_item_id", shop_item_id).execute()
        
        if existing_purchase.data:
            print(f"❌ [DEBUG] Item already purchased by user")
            raise HTTPException(status_code=400, detail="Item already purchased")
        
        # Process purchase
        print(f"🔍 [DEBUG] Processing purchase transaction...")
        
        # Deduct coins from user
        new_coin_amount = user_profile["coins"] - shop_item["coin_price"]
        coin_update = supabase.table("user_profiles").update({
            "coins": new_coin_amount
        }).eq("user_id", user_id).execute()
        
        print(f"🔍 [DEBUG] Updated user coins to: {new_coin_amount}")
        
        # Add purchase record
        purchase_insert = supabase.table("user_purchases").insert({
            "user_id": user_id,
            "shop_item_id": shop_item_id
        }).execute()
        
        print(f"✅ [DEBUG] Purchase completed successfully")
        
        return {
            "success": True,
            "item_purchased": shop_item["name"],
            "coins_spent": shop_item["coin_price"],
            "coins_remaining": new_coin_amount
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [DEBUG] Error processing purchase: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/complete-task/{user_id}")
async def complete_task(user_id: str, task_type: str = "custom", difficulty: str = "medium"):
    """Complete a task and award XP/coins - HARDCODED VALUES FOR NOW"""
    try:
        print(f"🔍 [DEBUG] Completing task for user: {user_id}, type: {task_type}, difficulty: {difficulty}")
        
        supabase = get_supabase()
        
        # HARDCODED XP/COIN VALUES - TODO: Make these configurable
        task_rewards = {
            "daily_habit": {"easy": 8, "medium": 10, "hard": 15},
            "exercise": {"easy": 12, "medium": 15, "hard": 20},
            "assignment": {"easy": 15, "medium": 20, "hard": 30},
            "custom": {"easy": 8, "medium": 10, "hard": 15}
        }
        
        base_xp = task_rewards.get(task_type, task_rewards["custom"]).get(difficulty, 10)
        base_coins = base_xp // 2  # Coins are half of XP
        
        print(f"🔍 [DEBUG] Base rewards: {base_xp} XP, {base_coins} coins")
        
        # Get current user profile
        profile_result = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
        
        if not profile_result.data:
            print(f"❌ [DEBUG] User profile not found: {user_id}")
            raise HTTPException(status_code=404, detail="User profile not found")
        
        profile = profile_result.data[0]
        
        # Calculate new values
        new_xp = profile["xp"] + base_xp
        new_coins = profile["coins"] + base_coins
        new_streak = profile["streak"] + 1  # TODO: Add proper streak logic with dates
        
        # Calculate level (100 XP per level)
        new_level = max(1, new_xp // 100 + 1)
        level_up = new_level > profile["level"]
        
        if level_up:
            new_coins += 25  # Level up bonus
            print(f"🌟 [DEBUG] LEVEL UP! {profile['level']} -> {new_level}")
        
        # Update user profile
        update_result = supabase.table("user_profiles").update({
            "xp": new_xp,
            "coins": new_coins,
            "level": new_level,
            "streak": new_streak
        }).eq("user_id", user_id).execute()
        
        print(f"✅ [DEBUG] Task completed: +{base_xp} XP, +{base_coins} coins, streak: {new_streak}")
        
        return {
            "success": True,
            "xp_earned": base_xp,
            "coins_earned": base_coins + (25 if level_up else 0),
            "new_xp": new_xp,
            "new_coins": new_coins,
            "new_level": new_level,
            "new_streak": new_streak,
            "level_up": level_up
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ [DEBUG] Error completing task: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")