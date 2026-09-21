<?php


namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;

use Kreait\Firebase\Exception\Auth\InvalidIdToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Kreait\Firebase\Factory;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\DB;


use Exception;
class UserController extends Controller
{
    protected $auth;

    public function __construct()
    {
        $firebasePath = config('firebase.credentials'); // Full path to JSON
        $projectId = config('firebase.project_id');

        if (!$firebasePath || !file_exists($firebasePath)) {
            throw new \Exception("Firebase credentials file not found at: $firebasePath");
        }

        $this->auth = (new Factory)
            ->withServiceAccount($firebasePath)
            ->withProjectId($projectId)
            ->createAuth();
    }


    public function adminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['This account is not active.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'admin' => $user,
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function adminLogout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Admin logged out successfully.'
        ], 200);
    }
     public function adminMe(Request $request)
    {
        return response()->json([
            'admin' => $request->user(),
            'user' => $request->user(),
        ]);
    }
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'nullable|string|email|max:255|unique:users',
            'phone' => 'nullable|string|min:9|max:15|unique:users',
            'password' => 'required|string|min:6',
            'name' => 'nullable|string|max:255',
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
    
        if (!$request->email && !$request->phone) {
            return response()->json(['error' => 'Either email or phone is required'], 422);
        }
    
        try {
            // Create Firebase user (using email or phone)
            $firebaseUser = null;
    
            if ($request->email) {
                $firebaseUser = $this->auth->createUserWithEmailAndPassword(
                    $request->email,
                    $request->password
                );
            } elseif ($request->phone) {
                // Optional: create Firebase user via phone, or handle manually
                $firebaseUser = $this->auth->createUser([
                    'phoneNumber' => $request->phone,
                ]);
            }
    
            // Default name fallback
            $defaultName = $request->name ??
                ($request->email ? explode('@', $request->email)[0] : 'User_' . substr($request->phone, -4));
    
            $user = User::create([
                'firebase_uid' => $firebaseUser?->uid,
                'name' => $defaultName,
                'email' => $request->email,
                'phone' => $request->phone,
                'profile_url' => 'https://yourdomain.com/storage/defaults/profile.png',
            ]);
    
            $token = $user->createToken('auth-token')->plainTextToken;
    
            return response()->json([
                'message' => 'User registered successfully',
                'token' => 'Bearer ' . $token,
                'user' => $user,
            ], 201);
    
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function uploadProfilePhoto(Request $request)
    {
        try {
            // ✅ Validate file
            $validator = Validator::make($request->all(), [
                'photo' => 'required|file|mimes:jpeg,png,jpg,webp,heic,heif|max:10240',// Accept any image ≤ 2MB
            ]);
    
            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }
    
            // ✅ Get the currently authenticated user
            $user = $request->user();
    
            // ✅ Upload file to S3
            $disk = Storage::disk('s3');
            $photoPath = $request->file('photo')->store('profiles', 's3');
            $disk->setVisibility($photoPath, 'public');
            $photoUrl = $disk->url($photoPath);
    
            // ✅ Update the correct column in the database
            $user->update(['profile_url' => $photoUrl]);
    
            // ✅ Return consistent JSON
            return response()->json([
                'status' => true,
                'message' => 'Profile photo uploaded successfully.',
                'profile_url' => $photoUrl,
            ], 200);
    
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Photo upload failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    public function googleLogin(Request $request)
    {
        // 1. Validate the request
        $validator = Validator::make($request->all(), [
            'id_token' => 'required|string',
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
    
        try {
            // 2. Verify the Google ID token with Firebase
            $verifiedIdToken = $this->auth->verifyIdToken($request->id_token);
            $uid = $verifiedIdToken->claims()->get('sub');
    
            // 3. Find the user or create a new one if they don't exist
            $user = User::updateOrCreate(
                ['firebase_uid' => $uid],
                [
                    'name' => $verifiedIdToken->claims()->get('name'),
                    'email' => $verifiedIdToken->claims()->get('email'),
                ]
            );
    
            // =============================================================
            //  ADD THIS LINE TO RELOAD THE MODEL FROM THE DATABASE
            //  This will fetch the default 'role' and 'status' values.
            $user->refresh();
            // =============================================================
    
            // 5. Create a new Sanctum API token for the user session
            $token = $user->createToken('auth-token')->plainTextToken;
    
            // 6. Return the successful response
            return response()->json([
                'message' => 'Login successful.',
                'token' => 'Bearer ' . $token,
                'user' => $user, // The $user object now contains all fields
            ], 200);
    
        } catch (InvalidIdToken $e) {
            return response()->json(['message' => 'Invalid Google token: ' . $e->getMessage()], 401);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'An unexpected error occurred: ' . $e->getMessage()], 500);
        }
    }
    public function login(Request $request)
    {
        // 1. Validate the incoming email and password
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            // 2. Ask Firebase to verify the email and password
            $signInResult = $this->auth->signInWithEmailAndPassword($request->email, $request->password);

            // 3. If successful, get the user's unique Firebase ID (UID)
            $firebaseUid = $signInResult->firebaseUserId();

            // 4. Find the matching user in your local database using the UID
            $user = User::where('firebase_uid', $firebaseUid)->first();

            // Handle the edge case where the user exists in Firebase but not your database
            if (!$user) {
                return response()->json([
                    'message' => 'User is authenticated but not found in our records.'
                ], 404);
            }

            // 5. Create a new Sanctum API token for this session
            $token = $user->createToken('auth-token')->plainTextToken;

            // 6. Return the successful response
            return response()->json([
                'message' => 'Login successful',
                'token' => 'Bearer ' . $token,
                'user' => $user,
            ]);

        } catch (\Kreait\Firebase\Exception\Auth\InvalidPassword | \Kreait\Firebase\Exception\Auth\UserNotFound $e) {
            // This specifically catches authentication failures from Firebase
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401); // 401 Unauthorized
        } catch (\Throwable $e) {
            // This catches any other unexpected errors
            return response()->json(['error' => 'An unexpected server error occurred.'], 500);
        }
    }
    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['status' => true, 'message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json([
            'status' => true,
            'user' => $request->user(),
        ]);
    }
    public function index()
    {

        $users = User::query()->orderBy('created_at', 'desc')->get();

        // 3. Response: Return the list of users
        return response()->json($users, 200);
    }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => 'required|string|min:6',
            'role' => ['nullable', 'string', Rule::in(['user', 'admin'])],
            'status' => ['nullable', 'string', Rule::in(['active', 'suspended'])],
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'user',
            'status' => $data['status'] ?? 'active',
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }
     public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user, 200);
    }
   public function update(Request $request, $id)
    {
        // 1. Find the user by their ID
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        // 2. Validate the incoming data
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id), // Ensure email is unique, ignoring the current user
            ],
            'password' => 'sometimes|nullable|string|min:6',
            'role' => ['sometimes', 'required', 'string', Rule::in(['user', 'admin'])],
            'status' => ['sometimes', 'required', 'string', Rule::in(['active', 'suspended'])],
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // 3. Update the user with validated data
        $data = $validator->validated();
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        // 4. Return the success response
        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user,
        ], 200);
    }
     public function destroy($id)
    {
        // 1. Find the user by their ID
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        if (request()->user()?->id === $user->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        try {
            // 2. IMPORTANT: Delete the user from Firebase Authentication first
            if ($user->firebase_uid) {
                $this->auth->deleteUser($user->firebase_uid);
            }

            // 3. If Firebase deletion is successful, delete the user from the local database
            $user->delete();

            // 4. Return the success response
            return response()->json(['message' => 'User deleted successfully from Firebase and local database.'], 200);

        } catch (\Throwable $e) {
            // Catch errors (e.g., user not found in Firebase, permission issues)
            return response()->json(['error' => 'Failed to delete user: ' . $e->getMessage()], 500);
        }
    }
   
    public function blockUser($id)
   {
       $user = User::find($id);
   
       if (!$user) {
           return response()->json(['message' => 'User not found.'], 404);
       }
   
       // Prevent blocking admins (optional, but usually good practice)
       if ($user->role === 'admin') {
           return response()->json(['message' => 'Admins cannot be blocked.'], 403);
       }
   
       $user->status = 'suspended';
       $user->save();
   
       return response()->json([
           'message' => 'User blocked successfully.',
           'user' => $user
       ], 200);
   }
    public function unblockUser($id)
    {
        $user = User::find($id);
    
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    
        $user->status = 'active';
        $user->save();
    
        return response()->json([
            'message' => 'User unblocked successfully.',
            'user' => $user
        ], 200);
    }
    public function changeRole(Request $request, $id)
    {
        $user = User::find($id);
    
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    
        // Validate role input
        $validator = Validator::make($request->all(), [
            'role' => ['required', Rule::in(['user', 'admin'])],
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
    
        $user->role = $request->role;
        $user->save();
    
        return response()->json([
            'message' => 'User role updated successfully.',
            'user' => $user
        ], 200);
    }

    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $currentUser = $request->user();

        if (!$currentUser) {
            return UserResource::collection([]);
        }

        if (strlen($query) < 2) {
            return UserResource::collection([]);
        }

        // ✅ FINAL, ROBUST QUERY FOR POSTGRESQL
        $users = User::where('id', '!=', $currentUser->id)
            ->where(function ($q) use ($query) {
                $searchTerm = '%' . strtolower($query) . '%';
                // Using ::text is a robust way to ensure PostgreSQL treats the column as text before LOWER()
                $q->where(DB::raw('LOWER(name::text)'), 'like', $searchTerm)
                  ->orWhere(DB::raw('LOWER(email::text)'), 'like', $searchTerm);
            })
            ->limit(10)
            ->get();
            
        return UserResource::collection($users);
    }
       
}

