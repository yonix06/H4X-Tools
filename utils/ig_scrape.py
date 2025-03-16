"""
 Copyright (c) 2023-2025. Vili and contributors.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

from ensta import Guest
from helper import printer, timer
from colorama import Style

class Scrape:
    """
    Scrapes data from an Instagram account.

    :param target: The username of the account to scrape.
    """
    @timer.timer
    def __init__(self, target) -> None:
        self.data = None
        printer.info(f"Trying to scrape information about {Style.BRIGHT}{target}{Style.RESET_ALL}...")

        try:
            api = Guest()
            response = api.profile(target)
            self.data = self.format_data(response.raw)
            self.print_user_info(self.data)
        except Exception as e:
            printer.error(f"Error : {e}")
            return

    def format_data(self, raw_data) -> dict:
        """Format the raw data into a clean dictionary"""
        return {
            'username': raw_data.get('username', 'N/A'),
            'full_name': raw_data.get('full_name', 'N/A'),
            'biography': raw_data.get('biography', 'N/A'),
            'website': raw_data.get('external_url', 'N/A'),
            'followers': raw_data.get('edge_followed_by', {}).get('count', 'N/A'),
            'following': raw_data.get('edge_follow', {}).get('count', 'N/A'),
            'profile_picture_url': raw_data.get('profile_pic_url', 'N/A'),
            'is_private': raw_data.get('is_private', 'N/A'),
            'is_verified': raw_data.get('is_verified', 'N/A'),
            'total_posts': raw_data.get('edge_owner_to_timeline_media', {}).get('count', 'N/A')
        }

    def get_data(self) -> dict:
        """Return the formatted data"""
        return self.data or {
            'error': 'Failed to fetch Instagram data',
            'username': 'N/A',
            'full_name': 'N/A',
            'biography': 'N/A',
            'website': 'N/A',
            'followers': 'N/A',
            'following': 'N/A',
            'profile_picture_url': 'N/A',
            'is_private': 'N/A',
            'is_verified': 'N/A',
            'total_posts': 'N/A'
        }

    # Function to print user information
    def print_user_info(self, data) -> None:
        for key, value in data.items():
            printer.success(f"{key.replace('_', ' ').title()} : {value}")